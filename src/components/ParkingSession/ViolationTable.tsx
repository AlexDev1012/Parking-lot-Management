import { FC, ReactNode, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { LprSessionType, SessionsState } from "../../types";
import { useAppSelector, useAppDispatch, RootState } from "../../redux/store";
import { Button } from "primereact/button";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import {
  fetchViolations,
  handleParkingSessionDelete,
  handleParkingSessionUpdate,
} from "../../redux/slice/psReducer";
import { formatTimestamp } from "../../utils";

interface Props {
  plateNumber: string;
  reasonBody: (arg1: LprSessionType) => ReactNode;
  vehicleBody: (arg1: LprSessionType) => ReactNode;
  handleVisible: (arg1: LprSessionType) => void;
  onPageChange: (page: number, limit: number) => void;
}

const ViolationTable: FC<Props> = ({
  plateNumber,
  reasonBody,
  vehicleBody,
  handleVisible,
  onPageChange,
}) => {
  const { violations, resolvedViolations, pLoading } = useAppSelector(
    (state: RootState) => state.ps
  );
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [editSession, setEditSession] = useState<LprSessionType | null>(null);
  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const [tableData, setTableData] = useState<SessionsState<LprSessionType>>({
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    isLoading: false,
  });

  const handleDelete = async (item: LprSessionType) => {
    await dispatch(handleParkingSessionDelete([item])).unwrap();
    await dispatch(
      fetchViolations({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: violations.pagination.page,
        limit: violations.pagination.limit,
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
        fine: item.fine || 0,
      })
    ).unwrap();
    await dispatch(
      fetchViolations({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: violations.pagination.page,
        limit: violations.pagination.limit,
      })
    ).unwrap();
  };

  useEffect(() => {
    dispatch(
      fetchViolations({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: violations.pagination.page,
        limit: violations.pagination.limit,
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

  useEffect(() => {
    if (user?.customClaims.level === 1) {
      setTableData(violations);
    } else {
      setTableData(resolvedViolations);
    }
  }, [violations.data, resolvedViolations.data]);

  return (
    <>
      <DataTable
        value={tableData.data}
        header={renderHeader()}
        lazy
        paginator
        first={(tableData.pagination.page - 1) * tableData.pagination.limit}
        rows={tableData.pagination.limit}
        totalRecords={tableData.pagination.total}
        onPage={handlePageChange}
        loading={tableData.isLoading}
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
        <Column field="country" header="Country" />
        <Column field="plateNumber" header="Plate" />
        <Column
          field="vehicle"
          header="Vehicle & Plate"
          body={vehicleBody}
        ></Column>
        {user?.customClaims.level === 1 && (
          <Column
            field="entryTime"
            header="Entry"
            body={(item: LprSessionType) =>
              item.entryTime &&
              moment(item.entryTime).format("MM/DD/YYYY HH:mm:ss")
            }
          />
        )}

        <Column
          field="exitTime"
          header={user?.customClaims.level === 1 ? "Exit" : "Violation Date"}
          body={(item: LprSessionType) =>
            item.exitTime && moment(item.exitTime).format("MM/DD/YYYY HH:mm:ss")
          }
        />
        {user?.customClaims.level !== 1 && (
          <Column
            field="violationLog.createdAt"
            header="Purchase Date"
            body={(item: LprSessionType) =>
              item.violationLog?.createdAt &&
              formatTimestamp(item.violationLog.createdAt)
            }
          />
        )}
        {user?.customClaims.level === 1 && (
          <Column field="reason" header="Reason" body={reasonBody} />
        )}
        <Column field="noticeNumber" header="Notice" />
        {user?.customClaims.level === 1 && (
          <Column field="outstandingViolations" header="Outstanding" />
        )}
        <Column
          header="Fine"
          body={(item: LprSessionType) => (
            <p>
              $
              {user?.customClaims.level === 1
                ? item.fine
                : Math.round((item.fine * (100 - item.lot.percentage)) / 100)}
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
                <Button
                  icon="pi pi-download"
                  size="small"
                  className="h-[38px] p-success"
                  onClick={() => handleVisible(item)}
                  loading={pLoading === item._id}
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Fine</label>
            <InputNumber
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              mode="currency"
              currency="USD"
              min={0}
              value={editSession?.fine}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    fine: e.value || 0,
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

export default ViolationTable;
