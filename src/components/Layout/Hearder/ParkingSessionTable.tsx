import { FC, useEffect, useState } from "react";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { calculateTotalAmount, formatTimestamp } from "../../../utils";
import { LprSessionType } from "../../../types";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../redux/store";
import { fetchByPlateNumberForLpr } from "../../../redux/slice/statsReducer";
import HtmlTooltip from "../../HtmlToolTip";
import { Dialog } from "primereact/dialog";

interface Props {
  plateNumber: string;
  onPageChange: (page: number, limit: number) => void;
}

const ParkingSessionTable: FC<Props> = ({ plateNumber, onPageChange }) => {
  const dispatch = useAppDispatch();
  const { SearchResults } = useAppSelector((state: RootState) => state.stats);
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
  };

  const vehicleBody = (product: LprSessionType) => (
    <>
      <HtmlTooltip
        title={
          <div className="flex gap-4">
            <div className="w-[50%]">
              <span className="text-xl text-black">(Entrance)</span>
              {product.vehicle1 ? (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.vehicle1
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.vehicle1
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.plate1
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.plate1
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                </div>
              ) : (
                <p>No Enterance</p>
              )}
            </div>
            <div className="w-[50%]">
              <span className="text-xl text-black">(Exit)</span>
              {product.vehicle2 ? (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.vehicle2
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.vehicle2
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.plate2
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.plate2
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                </div>
              ) : (
                <p>Currently Parking...</p>
              )}
            </div>
          </div>
        }
      >
        <span className={`underline text-blue-500 cursor-pointer`}>
          (Entrance Exit)
        </span>
      </HtmlTooltip>

      {/* Image Preview Dialog */}
      <Dialog
        visible={!!selectedImage}
        onHide={() => setSelectedImage(null)}
        style={{ width: "auto", maxWidth: "90vw" }}
        header="Image Preview"
        headerClassName="flex justify-center w-full"
        className="p-0"
        modal
      >
        <div className="flex justify-center items-center w-full">
          {selectedImage && (
            <img
              src={selectedImage}
              style={{ maxWidth: "100%", maxHeight: "90vh", minWidth: "30vw" }}
              alt="Preview"
            />
          )}
        </div>
      </Dialog>
    </>
  );

  useEffect(() => {
    dispatch(
      fetchByPlateNumberForLpr({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: SearchResults.parkingSessions.pagination.page,
        limit: SearchResults.parkingSessions.pagination.limit,
      })
    );
  }, [sortOrder]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "OK":
        return "info";
      case "PAID":
        return "success";
      case "RESOLVED":
        return "success";
      case "MISTAKE":
        return "danger";
      default:
        return "warning";
    }
  };

  const getStatusValue = (status: string) => {
    switch (status) {
      case "OK":
        return "Parking Now";
      case "PAID":
        return "Paid";
      case "NOTFULL":
        return "Not full";
      case "NOPAY":
        return "No payment";
      case "RESOLVED":
        return "Resolved";
      case "MISTAKE":
        return "Mistake";
      default:
        return status;
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-end border-b-2 w-full pb-2 gap-2">
        <Button
          icon={sortOrder ? "pi pi-sort-amount-down" : "pi pi-sort-amount-up"}
          onClick={() => setSortOrder(!sortOrder)}
          tooltip={sortOrder ? "Sort Oldest First" : "Sort Latest First"}
          tooltipOptions={{ position: "top" }}
          className="p-button-outlined hover:shadow-md transition-all"
          severity="secondary"
          label={sortOrder ? "Newest First" : "Oldest First"}
          pt={{
            root: { className: "border border-gray-200" },
          }}
        />
      </div>
    );
  };

  return (
    <DataTable
      value={SearchResults.parkingSessions.data}
      header={renderHeader()}
      lazy
      paginator
      first={
        (SearchResults.parkingSessions.pagination.page - 1) *
        SearchResults.parkingSessions.pagination.limit
      }
      rows={SearchResults.parkingSessions.pagination.limit}
      totalRecords={SearchResults.parkingSessions.pagination.total}
      onPage={handlePageChange}
      loading={SearchResults.parkingSessions.isLoading}
      rowsPerPageOptions={[5, 10, 25, 50]}
      emptyMessage={
        <div className="text-center py-8">
          <i className="pi pi-inbox text-gray-400 text-4xl mb-4" />
          <p className="text-gray-600">No parking sessions found</p>
        </div>
      }
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sessions"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      pt={{
        wrapper: { className: "shadow-sm rounded-lg overflow-hidden" },
        thead: { className: "bg-gray-50" },
        paginator: {
          pageButton: ({ context }: { context: any }) => ({
            className: context.active
              ? "bg-blue-500 text-white text-[12px]"
              : undefined,
          }),
        },
      }}
    >
      <Column field="lot.siteCode" header="Lot" />
      <Column field="plateNumber" header="Plate" />
      <Column field="country" header="Country" />
      <Column
        field="entryTime"
        header="Entry Time"
        body={(item: LprSessionType) =>
          item.entryTime && formatTimestamp(item.entryTime)
        }
      />
      <Column
        field="exitTime"
        header="Exit Time"
        body={(item: LprSessionType) =>
          item.exitTime && formatTimestamp(item.exitTime)
        }
      />

      <Column
        field="vehicle"
        header="Vehicle & Plate"
        body={vehicleBody}
      ></Column>
      <Column
        header="Paid Start"
        body={(item: LprSessionType) => {
          if (!item.paymentLogs.length || !item.paymentLogs[0]?.purchasedDate)
            return "";
          try {
            return formatTimestamp(item.paymentLogs[0].purchasedDate);
          } catch {
            return "";
          }
        }}
      />
      <Column
        header="Paid End"
        body={(item: LprSessionType) => {
          if (
            !item.paymentLogs.length ||
            !item.paymentLogs[item.paymentLogs.length - 1]?.expirationDate
          )
            return "";
          try {
            return formatTimestamp(
              item.paymentLogs[item.paymentLogs.length - 1].expirationDate
            );
          } catch {
            return "";
          }
        }}
      />
      <Column
        header="App Type"
        body={(item: LprSessionType) => item.paymentLogs[0]?.appType}
      />
      <Column
        header="Amount"
        body={(item: LprSessionType) => {
          if (!item.paymentLogs.length) return "";
          const amount = calculateTotalAmount(item.paymentLogs);
          return !isNaN(amount) ? `$${amount}` : "";
        }}
      />
      <Column
        field="status"
        header="Status"
        body={(rowData) => (
          <Tag
            value={getStatusValue(rowData.status)}
            severity={getStatusSeverity(rowData.status)}
          />
        )}
      />
    </DataTable>
  );
};

export default ParkingSessionTable;
