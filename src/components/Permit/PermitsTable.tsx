import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { PaginationParams, PermitType, SessionsState } from "../../types";
import { formatTimestamp } from "../../utils";
import { useState } from "react";
import {
  deletePermit,
  setCreateModalVisible,
} from "../../redux/slice/pmReducer";
import { Button } from "primereact/button";
import { RootState, useAppDispatch, useAppSelector } from "../../redux/store";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PermitsTable({
  plateNumber,
  permits,
  activeTab,
  fetchCurrentTabData,
}: {
  plateNumber: string;
  permits: SessionsState<PermitType>;
  activeTab: number;
  fetchCurrentTabData: (params: PaginationParams) => void;
}) {
  const { users } = useAppSelector((state: RootState) => state.app);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();

  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [selectedPermits, setSelectedPermits] = useState<PermitType[]>([]);

  const handlePageChange = (event: DataTablePageEvent) => {
    fetchCurrentTabData({
      page: (event.page || 0) + 1,
      limit: event.rows,
      plateNumber,
      sortOrder: sortOrder ? "asc" : "desc",
    });
  };

  const handleDelete = async (ids: string[]) => {
    await dispatch(deletePermit(ids)).unwrap();
    fetchCurrentTabData({
      page: permits.pagination.page,
      limit: permits.pagination.limit,
      plateNumber,
      sortOrder: sortOrder ? "asc" : "desc",
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
          className="h-[38px]"
          label={sortOrder ? "Newest First" : "Oldest First"}
        />
        {user?.customClaims.level === 1 && (
          <Button
            label="Delete"
            icon="pi pi-trash"
            size="small"
            className="h-[38px] p-danger"
            onClick={(e) =>
              confirmPopup({
                target: e.currentTarget,
                message: "Do you want to delete these records?",
                accept: () => {
                  handleDelete(selectedPermits.map((p) => p._id || ""));
                },
                reject: () => {},
                defaultFocus: "reject",
                acceptClassName: "p-danger",
              })
            }
          />
        )}
        {activeTab === 0 && (
          <Button
            label="Create Permit"
            icon="pi pi-plus"
            onClick={() => dispatch(setCreateModalVisible(true))}
            className="px-4 py-2.5 shadow-sm hover:shadow-md transition-all"
            pt={{
              root: {
                className: "bg-gradient-to-r from-green-500 to-green-600",
              },
              label: { className: "font-medium" },
              icon: { className: "mr-2" },
            }}
          />
        )}
      </div>
    );
  };
  return (
    <div className="card">
      <DataTable
        value={permits.data}
        header={renderHeader}
        paginator
        lazy
        selection={selectedPermits}
        onSelectionChange={(e) => setSelectedPermits(e.value as PermitType[])}
        selectionMode="multiple"
        rows={permits.pagination.limit}
        first={(permits.pagination.page - 1) * permits.pagination.limit}
        totalRecords={permits.pagination.total}
        loading={permits.isLoading}
        onPage={handlePageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        className="p-datatable-sm"
        emptyMessage={
          <div className="text-center py-8">
            <i className="pi pi-inbox text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600">No permits found</p>
          </div>
        }
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} permits"
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
        {activeTab === 1 && (
          <Column
            field="startDate"
            header="Start Date"
            body={(item: PermitType) =>
              item.startDate ? formatTimestamp(item.startDate) : "Not Specified"
            }
          />
        )}
        {activeTab === 1 && (
          <Column
            field="endDate"
            header="End Date"
            body={(item: PermitType) =>
              item.endDate ? formatTimestamp(item.endDate) : "Not Specified"
            }
          />
        )}
        <Column
          field="lot"
          header="Lot"
          body={(item: PermitType) => item.lot?.siteCode || "ALL LOTS"}
        />
        {activeTab === 1 && (
          <Column
            field="paidStatus"
            header="Paid"
            body={(item: PermitType) =>
              item.paidStatus ? (
                <p className="text-green-500">✔</p>
              ) : (
                <p className="text-red-500">✘</p>
              )
            }
          />
        )}
      </DataTable>
      <ConfirmPopup />
    </div>
  );
}
