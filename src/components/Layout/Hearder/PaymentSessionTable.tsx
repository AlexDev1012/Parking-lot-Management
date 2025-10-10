import { FC, useEffect, useState } from "react";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { formatTimestamp } from "../../../utils";
import { PaymentSessionType } from "../../../types";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../redux/store";
import { fetchByPlateNumberForPayment } from "../../../redux/slice/statsReducer";

interface Props {
  plateNumber: string;
  onPageChange: (page: number, limit: number) => void;
}

const PaymentSessionTable: FC<Props> = ({ plateNumber, onPageChange }) => {
  const dispatch = useAppDispatch();
  const { SearchResults } = useAppSelector((state: RootState) => state.stats);
  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
  };

  useEffect(() => {
    dispatch(
      fetchByPlateNumberForPayment({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: SearchResults.paymentSessions.pagination.page,
        limit: SearchResults.paymentSessions.pagination.limit,
      })
    );
  }, [sortOrder]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case "ViolationApp":
      case "PayingApp":
        return "success";
      case "T2":
        return "info";
    }
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
    <DataTable
      value={SearchResults.paymentSessions.data}
      header={renderHeader()}
      lazy
      paginator
      first={
        (SearchResults.paymentSessions.pagination.page - 1) *
        SearchResults.paymentSessions.pagination.limit
      }
      rows={SearchResults.paymentSessions.pagination.limit}
      totalRecords={SearchResults.paymentSessions.pagination.total}
      onPage={handlePageChange}
      loading={SearchResults.paymentSessions.isLoading}
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
      <Column header="Lot" field="lot.siteCode" />
      <Column field="plateNumber" header="Plate" />
      <Column
        header="Paid Start"
        body={(item: PaymentSessionType) => formatTimestamp(item.purchasedDate)}
      />
      <Column
        header="Paid End"
        body={(item: PaymentSessionType) =>
          formatTimestamp(item.expirationDate)
        }
      />
      <Column
        header="App Type"
        field="appType"
        body={(rowData) => (
          <Tag
            value={rowData.appType}
            severity={getStatusSeverity(rowData.appType)}
          />
        )}
      />
      <Column header="Amount" body={getPaidAmount} />
    </DataTable>
  );
};

export default PaymentSessionTable;
