import { FC, ReactNode, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import {
  DriverInfoType,
  LprSessionType,
  PaginationParams,
  SessionsState,
} from "../../types";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  handleParkingSessionDelete,
  handleParkingSessionUpdate,
} from "../../redux/slice/vsReducer";
import { defaultDriverInfo, ParkingSessionStatus } from "../../config";
import { formatTimestamp } from "../../utils";
import { Dialog } from "primereact/dialog";

interface Props {
  activeIndex: number;
  plateNumber: string;
  violations: SessionsState<LprSessionType>;
  vehicleBody: (arg1: LprSessionType) => ReactNode;
  reasonBody: (arg1: LprSessionType) => ReactNode;
  handlePrint: (items: LprSessionType[]) => void;
  setEditSessionInfo: (sessionInfo: LprSessionType | null) => void;
  setEditDriverInfo: (driverInfo: DriverInfoType) => void;
  fetchCurrentTabData: ({
    page,
    limit,
    plateNumber,
    sortOrder,
  }: PaginationParams) => void;
}
const ViolationTable: FC<Props> = ({
  activeIndex,
  plateNumber,
  violations,
  vehicleBody,
  reasonBody,
  handlePrint,
  setEditSessionInfo,
  setEditDriverInfo,
  fetchCurrentTabData,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const { pLoading } = useAppSelector((state) => state.vs);
  const dispatch = useAppDispatch();

  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<LprSessionType[]>([]);
  const [selectedViolation, setSelectedViolation] =
    useState<LprSessionType | null>(null);

  const handleSelect = () => {
    violations.data.length === selectedItems.length
      ? setSelectedItems([])
      : setSelectedItems([...violations.data]);
  };

  const handlePageChange = (event: DataTablePageEvent) => {
    fetchCurrentTabData({
      page: (event.page || 0) + 1,
      limit: event.rows,
      plateNumber,
      sortOrder: sortOrder ? "asc" : "desc",
    });
    setSelectedItems([]);
  };

  const handleDelete = async (items: LprSessionType[]) => {
    await dispatch(handleParkingSessionDelete(items)).unwrap();
    fetchCurrentTabData({
      page: violations.pagination.page,
      limit: violations.pagination.limit,
      plateNumber,
      sortOrder: sortOrder ? "asc" : "desc",
    });
    setSelectedItems([]);
  };

  const handleCheck = async (status: string) => {
    if (!selectedViolation) return;
    const { _id } = selectedViolation;
    await dispatch(handleParkingSessionUpdate({ _id, status })).unwrap();
    fetchCurrentTabData({
      page: violations.pagination.page,
      limit: violations.pagination.limit,
      plateNumber,
      sortOrder: sortOrder ? "asc" : "desc",
    });
    setSelectedItems([]);
  };

  useEffect(() => {
    fetchCurrentTabData({ sortOrder: sortOrder ? "asc" : "desc" });
    setSelectedItems([]);
  }, [sortOrder]);

  const renderHeader = () => {
    return (
      <div className="flex justify-end border-b-2 w-full pb-2 gap-2">
        <Button
          icon={sortOrder ? "pi pi-sort-amount-down" : "pi pi-sort-amount-up"}
          onClick={() => setSortOrder(!sortOrder)}
          tooltip={sortOrder ? "Sort Oldest First" : "Sort Latest First"}
          tooltipOptions={{ position: "top" }}
          className="h-[38px]"
          label={sortOrder ? "Newest First" : "Oldest First"}
        />
        <Button
          icon="pi pi-check"
          label={
            violations.data.length &&
            violations.data.length === selectedItems.length
              ? "Unselect All"
              : "Select All"
          }
          size="small"
          className="h-[38px]"
          disabled={!violations.data.length}
          onClick={handleSelect}
        />
        <Button
          icon="pi pi-download"
          label="Print"
          size="small"
          className="h-[38px] p-success"
          loading={pLoading}
          disabled={!selectedItems.length}
          onClick={() => handlePrint(selectedItems)}
        />
        <Button
          icon="pi pi-trash"
          label="Delete"
          size="small"
          className="h-[38px] p-danger"
          disabled={!selectedItems.length}
          onClick={(e) =>
            confirmPopup({
              target: e.currentTarget,
              message: "Do you want to delete these records?",
              accept: () => {
                handleDelete(selectedItems);
                setSelectedItems([]);
              },
              reject: () => {},
              defaultFocus: "reject",
              acceptClassName: "p-danger",
            })
          }
        />
      </div>
    );
  };

  return (
    <>
      <DataTable
        value={violations.data}
        header={renderHeader()}
        selectionMode={"multiple"}
        selection={selectedItems}
        onSelectionChange={(e) => setSelectedItems(e.value)}
        lazy
        paginator
        first={(violations.pagination.page - 1) * violations.pagination.limit}
        rows={violations.pagination.limit}
        totalRecords={violations.pagination.total}
        onPage={handlePageChange}
        loading={violations.isLoading}
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
        className="p-datatable-sm"
      >
        <Column field="lot.siteCode" header="Lot" />
        <Column field="country" header="Country" />
        <Column field="plateNumber" header="Plate" />
        <Column field="vehicle" header="Vehicle & Plate" body={vehicleBody} />
        {activeIndex !== 3 && activeIndex !== 4 && (
          <Column
            field="entryTime"
            header="Entry"
            body={(item: LprSessionType) =>
              item.entryTime && formatTimestamp(item.entryTime)
            }
          />
        )}
        <Column
          field="exitTime"
          header={
            activeIndex === 3 || activeIndex === 4 ? "Violation Date" : "Exit"
          }
          body={(item: LprSessionType) =>
            item.exitTime && formatTimestamp(item.exitTime)
          }
        />
        {(activeIndex === 3 || activeIndex === 4) && (
          <Column
            field="violationLog.createdAt"
            header="Purchase Date"
            body={(item: LprSessionType) =>
              item.violationLog?.createdAt &&
              formatTimestamp(item.violationLog.createdAt)
            }
          />
        )}
        {activeIndex !== 3 && activeIndex !== 4 && (
          <Column
            field="printedAt"
            header="Time Since Printed"
            body={(item: LprSessionType) =>
              `${moment()
                .tz("America/New_York")
                .diff(item.printedAt, "days")} Days`
            }
          />
        )}
        {activeIndex !== 3 && activeIndex !== 4 && (
          <Column field="reason" header="Reason" body={reasonBody} />
        )}
        <Column field="noticeNumber" header="Notice" />
        <Column field="outstandingViolations" header="Outstanding" />
        <Column
          header="Fine"
          body={(item: LprSessionType) => <p>${item.fine}</p>}
        />
        {user?.customClaims.level === 1 &&
          activeIndex !== 3 &&
          activeIndex !== 4 && (
            <Column
              header="Actions"
              body={(item: LprSessionType) => (
                <div className="flex justify-center gap-1">
                  <Button
                    icon="pi pi-pencil"
                    tooltip="Session"
                    size="small"
                    className="h-[38px]"
                    onClick={() => setEditSessionInfo(item)}
                  />
                  <Button
                    icon="pi pi-pencil"
                    tooltip="Driver"
                    size="small"
                    className={`h-[38px] ${
                      !item?.driverInfo ? "p-button-text p-success" : ""
                    }`}
                    onClick={() =>
                      setEditDriverInfo(
                        item?.driverInfo || {
                          ...defaultDriverInfo,
                          plateNumber: item.plateNumber,
                        }
                      )
                    }
                  />
                  <Button
                    icon="pi pi-check"
                    size="small"
                    className="h-[38px] p-success"
                    onClick={() => {
                      setSelectedViolation(item);
                    }}
                  />
                </div>
              )}
            />
          )}
      </DataTable>
      <Dialog
        visible={!!selectedViolation}
        onHide={() => setSelectedViolation(null)}
        header="Update Violation Status"
        modal
        dismissableMask
        closeOnEscape
        style={{ width: "550px" }}
        pt={{
          root: { className: "border-round-xl" },
          header: {
            className: "bg-gray-50 border-bottom-1 border-gray-200 py-3 px-4",
          },
          content: { className: "py-4 px-4" },
          footer: { className: "border-top-1 border-gray-200 py-3 px-4" },
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Mark as Mistake"
              icon="pi pi-exclamation-circle"
              onClick={() => {
                if (selectedViolation) {
                  handleCheck(ParkingSessionStatus.MISTAKE);
                  setSelectedViolation(null);
                }
              }}
              outlined
              size="small"
              className="px-3 py-2 p-danger"
            />
            <Button
              label="Mark as Resolved"
              icon="pi pi-check"
              onClick={() => {
                if (selectedViolation) {
                  handleCheck(ParkingSessionStatus.RESOLVED);
                  setSelectedViolation(null);
                }
              }}
              size="small"
              className="px-3 py-2 p-success"
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setSelectedViolation(null)}
              text
              size="small"
              className="px-3 py-2"
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-info-circle text-primary text-xl"></i>
            <span className="text-lg">Please select the violation status</span>
          </div>
          <div className="pl-6">
            <p className="text-gray-600 mb-2">
              Select an appropriate status for violation ticket #
              {selectedViolation?.noticeNumber}:
            </p>
            <ul className="list-none p-0 m-0 text-gray-600">
              <li className="mb-2">
                <i className="pi pi-times-circle text-red-500 mr-2"></i>
                <span className="font-semibold">Mistake</span> - If this
                violation was issued in error
              </li>
              <li>
                <i className="pi pi-check-circle text-green-500 mr-2"></i>
                <span className="font-semibold">Resolved</span> - If the
                violation has been paid or settled
              </li>
            </ul>
          </div>
        </div>
      </Dialog>
      <ConfirmPopup />
    </>
  );
};

export default ViolationTable;
