import { FC, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { DataTablePageEvent } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import {
  calculateParkingTime,
  calculateTotalAmount,
  formatTimestamp,
} from "../../utils";
import moment from "moment";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import {
  fetchNonViolations,
  handleParkingSessionDelete,
  handleParkingSessionUpdate,
} from "../../redux/slice/psReducer";
import { LprSessionType } from "../../types";

interface Props {
  plateNumber: string;
  onPageChange: (page: number, limit: number) => void;
}

const NonViolationTable: FC<Props> = ({ plateNumber, onPageChange }) => {
  const dispatch = useAppDispatch();
  const { nonViolations } = useAppSelector((state) => state.ps);
  const user = useAppSelector((state) => state.auth.user);

  const [editSession, setEditSession] = useState<LprSessionType | null>(null);
  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const handleDelete = async (item: LprSessionType) => {
    await dispatch(handleParkingSessionDelete([item])).unwrap();
    await dispatch(
      fetchNonViolations({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: nonViolations.pagination.page,
        limit: nonViolations.pagination.limit,
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
        exitTime: item.exitTime || "",
      })
    ).unwrap();
    await dispatch(
      fetchNonViolations({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: nonViolations.pagination.page,
        limit: nonViolations.pagination.limit,
      })
    ).unwrap();
  };

  useEffect(() => {
    dispatch(
      fetchNonViolations({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: nonViolations.pagination.page,
        limit: nonViolations.pagination.limit,
      })
    );
  }, [sortOrder]);

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
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
    <>
      <DataTable
        value={nonViolations.data}
        header={renderHeader()}
        lazy
        paginator
        first={
          (nonViolations.pagination.page - 1) * nonViolations.pagination.limit
        }
        rows={nonViolations.pagination.limit}
        totalRecords={nonViolations.pagination.total}
        onPage={handlePageChange}
        loading={nonViolations.isLoading}
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
        <Column field="lot.siteCode" header="Lot" style={{ width: "8%" }} />
        <Column field="plateNumber" header="Plate" style={{ width: "8%" }} />
        <Column field="country" header="Country" style={{ width: "8%" }} />
        <Column
          field="entryTime"
          header="Entry"
          body={(item: LprSessionType) =>
            item.entryTime && formatTimestamp(item.entryTime)
          }
          style={{ width: "12%" }}
        />
        <Column
          field="exitTime"
          header="Exit"
          body={(item: LprSessionType) =>
            item.exitTime && formatTimestamp(item.exitTime)
          }
          style={{ width: "12%" }}
        />
        <Column
          header="Paid Start"
          body={(item: LprSessionType) =>
            item.paymentLogs.length
              ? formatTimestamp(item.paymentLogs[0]?.purchasedDate)
              : item.status
          }
          style={{ width: "12%" }}
        />
        <Column
          header="Paid End"
          body={(item: LprSessionType) =>
            item.paymentLogs.length
              ? formatTimestamp(
                  item.paymentLogs[item.paymentLogs.length - 1].expirationDate
                )
              : item.status
          }
          style={{ width: "12%" }}
        />
        <Column
          header="App Type"
          body={(item: LprSessionType) => item.paymentLogs[0]?.appType}
          style={{ width: "8%" }}
        />
        <Column
          header="Parking"
          body={(item) =>
            item.entryTime &&
            item.exitTime &&
            calculateParkingTime(item.entryTime, item.exitTime)
          }
          style={{ width: "8%" }}
        />
        <Column
          header="Amount"
          body={(item: LprSessionType) =>
            item.paymentLogs.length
              ? `$${calculateTotalAmount(item.paymentLogs)}`
              : item.status
          }
          style={{ width: "13%" }}
        />
        {user?.customClaims.level === 1 && (
          <Column
            header="Actions"
            body={(item: LprSessionType) => (
              <div className="flex justify-center gap-1">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  size="small"
                  className="h-[38px]"
                  onClick={() => setEditSession(item)}
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  className="h-[38px] p-danger"
                  onClick={(e) =>
                    confirmPopup({
                      target: e.currentTarget,
                      message: "Do you want to delete this record?",
                      accept: () => handleDelete(item),
                      reject: () => {},
                      defaultFocus: "reject",
                      acceptClassName: "p-danger",
                    })
                  }
                />
              </div>
            )}
          />
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Exit Time
            </label>
            <InputText
              type="datetime-local"
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={moment(editSession?.exitTime).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    exitTime: e.target.value,
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

export default NonViolationTable;
