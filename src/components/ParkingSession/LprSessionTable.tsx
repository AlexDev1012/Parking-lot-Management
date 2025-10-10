import { FC, ReactNode, useEffect, useState } from "react";
import moment from "moment";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { LprSessionType } from "../../types";
import { Dialog } from "primereact/dialog";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { useAppSelector, RootState, useAppDispatch } from "../../redux/store";
import { formatTimestamp } from "../../utils";
import {
  fetchCurrentSessions,
  handleParkingSessionDelete,
  handleParkingSessionUpdate,
} from "../../redux/slice/psReducer";

interface Props {
  plateNumber: string;
  cameraBody: (arg1: LprSessionType) => ReactNode;
  vehicleBody: (arg1: LprSessionType) => ReactNode;
  onPageChange: (page: number, limit: number) => void;
}

const LprSessionTable: FC<Props> = ({
  plateNumber,
  cameraBody,
  vehicleBody,
  onPageChange,
}) => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { currentSessions } = useAppSelector((state: RootState) => state.ps);
  const dispatch = useAppDispatch();

  const [editSession, setEditSession] = useState<LprSessionType | null>(null);
  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
  };

  const handleDelete = async (item: LprSessionType) => {
    await dispatch(handleParkingSessionDelete([item])).unwrap();
    await dispatch(
      fetchCurrentSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: currentSessions.pagination.page,
        limit: currentSessions.pagination.limit,
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
      fetchCurrentSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: currentSessions.pagination.page,
        limit: currentSessions.pagination.limit,
      })
    ).unwrap();
  };

  useEffect(() => {
    dispatch(
      fetchCurrentSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: currentSessions.pagination.page,
        limit: currentSessions.pagination.limit,
      })
    );
  }, [sortOrder]);

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
        paginator
        lazy
        header={renderHeader()}
        first={
          (currentSessions.pagination.page - 1) *
          currentSessions.pagination.limit
        }
        rows={currentSessions.pagination.limit}
        totalRecords={currentSessions.pagination.total}
        onPage={handlePageChange}
        loading={currentSessions.isLoading}
        rowsPerPageOptions={[10, 25, 50]}
        value={currentSessions.data}
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
        <Column
          field="lot.siteCode"
          header="Lot"
          headerClassName="w-[13%]"
        ></Column>
        <Column field="country" header="Country"></Column>
        <Column
          field="camera"
          header="Camera"
          body={cameraBody}
          headerClassName="w-[14%]"
        ></Column>
        <Column
          field="plateNumber"
          header="Plate"
          headerClassName="w-[16%]"
        ></Column>
        <Column
          field="vehicle"
          header="Vehicle & Plate"
          headerClassName="w-[16%]"
          body={vehicleBody}
        ></Column>
        <Column
          field="entryTime"
          header="Entry"
          body={(item: LprSessionType) =>
            item.entryTime && formatTimestamp(item.entryTime)
          }
          headerClassName="w-[15%]"
        ></Column>
        {user?.customClaims.level === 1 && (
          <Column
            header="Actions"
            body={(item: LprSessionType) => (
              <div className="flex justify-center gap-1">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  size="small"
                  className="h-[38px] "
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

export default LprSessionTable;
