import { FC, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { InputNumber } from "primereact/inputnumber";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import moment from "moment";
import {
  fetchPaymentSessions,
  handlePaymentSessionDelete,
  handlePaymentSessionUpdate,
} from "../../redux/slice/psReducer";
import { PaymentSessionType } from "../../types";

interface Props {
  plateNumber: string;
  onPageChange: (page: number, limit: number) => void;
}

const PaymentSessionTable: FC<Props> = ({ plateNumber, onPageChange }) => {
  const { paymentSessions } = useAppSelector((state) => state.ps);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [editSession, setEditSession] = useState<PaymentSessionType | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const handleDelete = async (item: PaymentSessionType) => {
    await dispatch(handlePaymentSessionDelete([item])).unwrap();
    await dispatch(
      fetchPaymentSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: paymentSessions.pagination.page,
        limit: paymentSessions.pagination.limit,
      })
    ).unwrap();
  };

  const handleUpdate = async (item: PaymentSessionType) => {
    await dispatch(
      handlePaymentSessionUpdate({
        _id: item._id,
        plateNumber: item.plateNumber,
        purchasedDate: item.purchasedDate,
        expirationDate: item.expirationDate,
        chargedAmount: item.chargedAmount,
      })
    ).unwrap();
    await dispatch(
      fetchPaymentSessions({
        page: paymentSessions.pagination.page,
        limit: paymentSessions.pagination.limit,
      })
    ).unwrap();
  };

  useEffect(() => {
    dispatch(
      fetchPaymentSessions({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: paymentSessions.pagination.page,
        limit: paymentSessions.pagination.limit,
      })
    );
  }, [sortOrder]);

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
  };

  const formatTimestamp = (timestamp: string) => {
    return moment(timestamp).format("MM/DD/YYYY HH:mm:ss");
  };

  const getPaidAmount = (item: PaymentSessionType) => {
    return `$${item.chargedAmount}`;
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
        value={paymentSessions.data}
        header={renderHeader()}
        lazy
        paginator
        first={
          (paymentSessions.pagination.page - 1) *
          paymentSessions.pagination.limit
        }
        rows={paymentSessions.pagination.limit}
        totalRecords={paymentSessions.pagination.total}
        onPage={handlePageChange}
        loading={paymentSessions.isLoading}
        rowsPerPageOptions={[5, 10, 25, 50]}
        emptyMessage={
          <div className="text-center py-8">
            <i className="pi pi-inbox text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600">No payment sessions found</p>
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
        <Column header="Lot" field="lot.siteCode" headerClassName="w-[13%]" />
        <Column field="plateNumber" header="Plate" />
        <Column
          header="Paid Start"
          body={(item: PaymentSessionType) =>
            formatTimestamp(item.purchasedDate)
          }
          style={{ width: "24%" }}
        />
        <Column
          header="Paid End"
          body={(item: PaymentSessionType) =>
            formatTimestamp(item.expirationDate)
          }
          style={{ width: "24%" }}
        />
        <Column header="App Type" field="appType" style={{ width: "20%" }} />
        <Column header="Amount" body={getPaidAmount} style={{ width: "10%" }} />
        {user?.customClaims.level === 1 && (
          <Column
            header="Actions"
            body={(item: PaymentSessionType) => (
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
            <label className="text-sm font-medium text-gray-700">
              Paid Start
            </label>
            <InputText
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={editSession?.purchasedDate}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    purchasedDate: e.target.value,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Paid End
            </label>
            <InputText
              type="datetime-local"
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={moment(editSession?.expirationDate).format(
                "YYYY-MM-DDTHH:mm"
              )}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    expirationDate: e.target.value,
                  });
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <InputNumber
              className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              mode="currency"
              currency="USD"
              min={0}
              value={editSession?.chargedAmount}
              onChange={(e) => {
                if (editSession) {
                  setEditSession({
                    ...editSession,
                    chargedAmount: e.value || 0,
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

export default PaymentSessionTable;
