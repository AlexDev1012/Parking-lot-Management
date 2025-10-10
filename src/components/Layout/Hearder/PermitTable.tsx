import { FC, useEffect, useState } from "react";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { formatTimestamp } from "../../../utils";
import { PermitType } from "../../../types";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../redux/store";
import { fetchByPlateNumberForLpr } from "../../../redux/slice/statsReducer";

interface Props {
  plateNumber: string;
  onPageChange: (page: number, limit: number) => void;
}

const PermitTable: FC<Props> = ({ plateNumber, onPageChange }) => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state: RootState) => state.app);
  const { SearchResults } = useAppSelector((state: RootState) => state.stats);
  const [sortOrder, setSortOrder] = useState<boolean>(false);

  const handlePageChange = (event: DataTablePageEvent) => {
    onPageChange((event.page || 0) + 1, event.rows);
  };

  useEffect(() => {
    dispatch(
      fetchByPlateNumberForLpr({
        plateNumber,
        sortOrder: sortOrder ? "asc" : "desc",
        page: SearchResults.permits.pagination.page,
        limit: SearchResults.permits.pagination.limit,
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
    <DataTable
      value={SearchResults.permits.data}
      header={renderHeader()}
      lazy
      paginator
      first={
        (SearchResults.permits.pagination.page - 1) *
        SearchResults.permits.pagination.limit
      }
      rows={SearchResults.permits.pagination.limit}
      totalRecords={SearchResults.permits.pagination.total}
      onPage={handlePageChange}
      loading={SearchResults.permits.isLoading}
      rowsPerPageOptions={[5, 10, 25, 50]}
      emptyMessage={
        <div className="text-center py-8">
          <i className="pi pi-inbox text-gray-400 text-4xl mb-4" />
          <p className="text-gray-600">No permits found</p>
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
        field="name"
        header="Name"
        body={(item: PermitType) =>
          item.createdBy
            ? users.find((u) => u.email === item.createdBy)?.displayName
            : item.name
        }
      />
      <Column field="reason" header="Reason" />
      <Column field="plate" header="Plate" />
      <Column
        field="startDate"
        header="Start Date"
        body={(item: PermitType) =>
          item.startDate ? formatTimestamp(item.startDate) : "Not Specified"
        }
      />
      <Column
        field="endDate"
        header="End Date"
        body={(item: PermitType) =>
          item.endDate ? formatTimestamp(item.endDate) : "Not Specified"
        }
      />
      <Column
        field="lot"
        header="Lot"
        body={(item: PermitType) => item.lot?.siteCode || "ALL LOTS"}
      />
      <Column
        field="paidStatus"
        header="Status"
        body={(rowData) => (
          <div className="flex justify-center">
            {rowData.paidStatus ? (
              <i className="pi pi-check text-green-500 text-xl" />
            ) : (
              <i className="pi pi-times text-red-500 text-xl" />
            )}
          </div>
        )}
      />
    </DataTable>
  );
};

export default PermitTable;
