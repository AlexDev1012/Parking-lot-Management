import { FC, ReactNode, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Dialog } from "primereact/dialog";
import ErrorReport from "./ErrorReport";
import { LprSessionType } from "../../types";
import moment from "moment";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import {
  fetchErrorSessions,
  handleParkingSessionDelete,
  handleParkingSessionUpdate,
} from "../../redux/slice/psReducer";

interface Props {
  plateNumber: string;
  cameraBody: (arg1: LprSessionType) => ReactNode;
  vehicleBody: (arg1: LprSessionType) => ReactNode;
  onPageChange: (page: number, limit: number) => void;
}

const ErrorSessionTable: FC<Props> = ({
  plateNumber,
  cameraBody,
  vehicleBody,
  onPageChange,
}) => {
  const { errorSessions } = useAppSelector((state) => state.ps);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [selectedItems, setSelectedItems] = useState<LprSessionType[]>([]);
  const [editSession, setEditSession] = useState<LprSessionType | null>(null);
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const handleSelect = () => {
    errorSessions.data.length === selectedItems.length
      ? setSelectedItems([])
      : setSelectedItems([...errorSessions.data]);
  };

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
  };

  const handleDelete = async (items: LprSessionType[]) => {
    await dispatch(handleParkingSessionDelete(items)).unwrap();
    await dispatch(
      fetchErrorSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: errorSessions.pagination.page,
        limit: errorSessions.pagination.limit,
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
      fetchErrorSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: errorSessions.pagination.page,
        limit: errorSessions.pagination.limit,
      })
    ).unwrap();
  };

  useEffect(() => {
    dispatch(
      fetchErrorSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: errorSessions.pagination.page,
        limit: errorSessions.pagination.limit,
      })
    );
  }, [sortOrder]);

  const renderHeader = () => {
    return (
      <div className="flex justify-end border-b-2 w-full pb-2 gap-2">
        {user?.customClaims.level === 1 && (
          <>
            <Button
              icon={
                sortOrder ? "pi pi-sort-amount-down" : "pi pi-sort-amount-up"
              }
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
            <Button
              icon="pi pi-check"
              label={
                errorSessions.data.length &&
                errorSessions.data.length === selectedItems.length
                  ? "Unselect All"
                  : "Select All"
              }
              size="small"
              className="h-[38px]"
              disabled={!errorSessions.data.length}
              onClick={handleSelect}
            />
            <PDFDownloadLink
              document={<ErrorReport data={selectedItems} />}
              fileName={`Error_Report_${
                new Date().toISOString().split("T")[0]
              }.pdf`}
              className="bg-transparent"
            >
              <Button
                icon="pi pi-download"
                label="Print"
                size="small"
                className="h-[38px] p-success"
                disabled={!selectedItems.length}
              />
            </PDFDownloadLink>
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
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <DataTable
        value={errorSessions.data}
        header={renderHeader()}
        selectionMode={"multiple"}
        selection={selectedItems}
        onSelectionChange={(e) => setSelectedItems(e.value)}
        lazy
        paginator
        first={
          (errorSessions.pagination.page - 1) * errorSessions.pagination.limit
        }
        rows={errorSessions.pagination.limit}
        totalRecords={errorSessions.pagination.total}
        onPage={handlePageChange}
        loading={errorSessions.isLoading}
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
        <Column field="lot.siteCode" header="Lot" headerClassName="w-[10%]" />
        <Column field="country" header="Country" />
        <Column field="camera" header="Camera" body={cameraBody} />
        <Column field="plateNumber" header="Plate" />
        <Column field="vehicle" header="Vehicle & Plate" body={vehicleBody} />
        <Column
          field="entryTime"
          header="Entry"
          body={(item: LprSessionType) =>
            item.entryTime &&
            moment(item.entryTime).format("MM/DD/YYYY HH:mm:ss")
          }
        />
        <Column
          field="exitTime"
          header="Exit"
          body={(item: LprSessionType) =>
            item.exitTime && moment(item.exitTime).format("MM/DD/YYYY HH:mm:ss")
          }
        />
        <Column
          header="Reason"
          body={(item: LprSessionType) => (
            <p className="text-red-600">
              {item.entryTime ? "No Exit" : "No Entry"}
            </p>
          )}
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
              </div>
            )}
          />
        )}
      </DataTable>

      <Dialog
        visible={editSession !== null}
        onHide={() => setEditSession(null)}
        header="Edit Session"
        modal
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
        className="w-[90vw] md:w-[50vw]"
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
          {editSession?.entryTime && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Entry Time
              </label>
              <InputText
                type="datetime-local"
                className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={moment(editSession?.entryTime).format(
                  "YYYY-MM-DDTHH:mm"
                )}
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
          )}
          {editSession?.exitTime && (
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
          )}
        </div>
      </Dialog>
      <ConfirmPopup />
    </>
  );
};

export default ErrorSessionTable;
