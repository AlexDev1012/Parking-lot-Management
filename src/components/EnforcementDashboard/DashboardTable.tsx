import { FC, useEffect, useState } from "react";
import moment from "moment";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { LprSessionType } from "../../types";
import { Dialog } from "primereact/dialog";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { useAppSelector, RootState, useAppDispatch } from "../../redux/store";
import {
  calculateParkingTime,
  calculateTotalAmount,
  formatTimestamp,
} from "../../utils";
import { handleParkingSessionUpdate } from "../../redux/slice/psReducer";
import HtmlTooltip from "../HtmlToolTip";
import {
  fetchParkingSessions,
  handleParkingSessionDelete,
} from "../../redux/slice/appReducer";
import { confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";

interface Props {
  plateNumber: string;
  onPageChange: (page: number, limit: number) => void;
}

const DashboardTable: FC<Props> = ({ plateNumber, onPageChange }) => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { parkingSessions } = useAppSelector((state: RootState) => state.app);
  const dispatch = useAppDispatch();

  const [editSession, setEditSession] = useState<LprSessionType | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<boolean>(false);

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

  const handleDelete = async (item: LprSessionType, kind: string) => {
    await dispatch(handleParkingSessionDelete({ item, kind })).unwrap();
    await dispatch(
      fetchParkingSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: parkingSessions.pagination.page,
        limit: parkingSessions.pagination.limit,
      })
    ).unwrap();
  };

  const handleUpdate = async (item: LprSessionType) => {
    await dispatch(
      handleParkingSessionUpdate({
        _id: item._id,
        plateNumber: item.plateNumber,
        country: item.country,
        entryTime: item.entryTime || "",
      })
    ).unwrap();
    await dispatch(
      fetchParkingSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: parkingSessions.pagination.page,
        limit: parkingSessions.pagination.limit,
      })
    ).unwrap();
  };

  useEffect(() => {
    dispatch(
      fetchParkingSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: parkingSessions.pagination.page,
        limit: parkingSessions.pagination.limit,
      })
    );
  }, [sortOrder]);

  const showPopup = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: LprSessionType
  ) => {
    confirmPopup({
      target: e.currentTarget,
      message: "Which session do you want to delete?",
      icon: "pi pi-exclamation-triangle",
      className: "p-2",
      defaultFocus: "accept",
      footer: (
        <div className="flex justify-center gap-4 w-full">
          <Button
            label="Enter"
            icon="pi pi-trash"
            className="p-danger"
            onClick={() => confirmDelete(item, "ENTER")}
          />
          <Button
            label="Exit"
            icon="pi pi-trash"
            className="p-danger"
            onClick={() => confirmDelete(item, "EXIT")}
          />
          <Button
            label="Full"
            icon="pi pi-trash"
            className="p-danger"
            onClick={() => confirmDelete(item, "FULL")}
          />
        </div>
      ),
    });
  };

  const confirmDelete = (item: LprSessionType, kind: string) => {
    confirmDialog({
      message: "Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-danger",
      reject: () => {},
      accept: () => handleDelete(item, kind),
    });
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

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "OK":
        return "info";
      case "FREE":
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
      case "FREE":
        return "Free";
      case "ERROR":
        return "Error";
      case "PERMIT":
        return "Permit";
      default:
        return status;
    }
  };

  return (
    <>
      <DataTable
        paginator
        lazy
        header={renderHeader()}
        first={
          (parkingSessions.pagination.page - 1) *
          parkingSessions.pagination.limit
        }
        rows={parkingSessions.pagination.limit}
        totalRecords={parkingSessions.pagination.total}
        onPage={handlePageChange}
        loading={parkingSessions.isLoading}
        rowsPerPageOptions={[10, 25, 50]}
        value={parkingSessions.data}
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
        <Column field="lot.siteCode" header="Lot"></Column>
        <Column field="country" header="Country"></Column>
        <Column field="plateNumber" header="Plate"></Column>
        <Column
          field="vehicle"
          header="Vehicle & Plate"
          body={vehicleBody}
        ></Column>
        <Column
          field="entryTime"
          header="Entry"
          body={(item: LprSessionType) =>
            item.entryTime && formatTimestamp(item.entryTime)
          }
        ></Column>
        <Column
          field="exitTime"
          header="Exit"
          body={(item: LprSessionType) =>
            item.exitTime && formatTimestamp(item.exitTime)
          }
        ></Column>
        <Column
          header="Paid Start"
          body={(item: LprSessionType) =>
            item.paymentLogs.length
              ? formatTimestamp(item.paymentLogs[0]?.purchasedDate)
              : ""
          }
        />
        <Column
          header="Paid End"
          body={(item: LprSessionType) =>
            item.paymentLogs.length
              ? formatTimestamp(
                  item.paymentLogs[item.paymentLogs.length - 1].expirationDate
                )
              : ""
          }
        />
        <Column
          header="App Type"
          body={(item: LprSessionType) => item.paymentLogs[0]?.appType}
        />
        <Column
          header="Parking"
          body={(item) =>
            item.entryTime &&
            item.exitTime &&
            calculateParkingTime(item.entryTime, item.exitTime)
          }
        />
        <Column
          header="Amount"
          body={(item: LprSessionType) =>
            item.paymentLogs.length
              ? `$${calculateTotalAmount(item.paymentLogs)}`
              : ""
          }
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
        {user?.customClaims.level === 1 && (
          <Column
            header="Actions"
            body={(item: LprSessionType) => (
              <div className="flex justify-center gap-1">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  className="h-[38px] "
                  onClick={() => setEditSession(item)}
                />
                <Button
                  className="p-button-text p-danger"
                  icon="pi pi-trash"
                  onClick={(e) => showPopup(e, item)}
                />
              </div>
            )}
          ></Column>
        )}
      </DataTable>

      <Dialog
        visible={editSession !== null}
        onHide={() => setEditSession(null)}
        header="Edit Session"
        className="w-[90vw] md:w-[50vw]"
        footer={
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              label="Cancel"
              onClick={() => setEditSession(null)}
              className="p-button-text p-danger"
            />
            <Button
              label="Update"
              onClick={() => {
                if (editSession) {
                  setEditSession(null);
                  handleUpdate(editSession);
                }
              }}
              className="p-button-primary p-success"
            />
          </div>
        }
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Plate Number
            </label>
            <InputText
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={editSession?.plateNumber}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    plateNumber: e.target.value,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <InputText
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={editSession?.country}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    country: e.target.value,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Entry Time
            </label>
            <InputText
              type="datetime-local"
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={moment(editSession?.entryTime).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    entryTime: e.target.value,
                  });
                }
              }}
            />
          </div>
        </div>
      </Dialog>
      <ConfirmPopup />
    </>
  );
};

export default DashboardTable;
