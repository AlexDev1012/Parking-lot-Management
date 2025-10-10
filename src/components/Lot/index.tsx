import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { RootState, useAppDispatch, useAppSelector } from "../../redux/store";
import {
  fetchLocations,
  fetchZones,
  setSelectedLot,
  setCreateModalVisible,
} from "../../redux/slice/lotReducer";
import LotCard from "./LotCard";
import CreateLotDialog from "./CreateLotDialog";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { LotType } from "../../types";
import { TextInput } from "@tremor/react";
import { fetchLots } from "../../redux/slice/appReducer";

const LotComponent = () => {
  const dispatch = useAppDispatch();
  const { lots } = useAppSelector((state) => state.app);
  const { selectedLot, isCreateModalVisible } = useAppSelector(
    (state) => state.lot
  );
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchLocations());
  }, [dispatch]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-building text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Parking Lots</h1>
            </div>
            <p className="text-gray-600">
              Manage and monitor your parking facilities across all locations
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <i className="pi pi-car text-blue-600" />
              <span className="font-medium text-blue-700">{lots.length}</span>
              <span className="text-blue-600">Lots</span>
            </div>
            <Button
              icon="pi pi-refresh"
              onClick={() => dispatch(fetchLots())}
              className="p-3 hover:shadow-md transition-all"
              severity="secondary"
              aria-label="Refresh"
            />
          </div>
        </div>
      </div>

      {/* Search and Actions Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
              <TextInput
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search by lot code"
                className="pl-10 w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
              />
            </div>
            <span className="text-xs text-gray-500 mt-1 ml-1">
              {globalFilterValue
                ? `Showing results for "${globalFilterValue}"`
                : "Enter keywords to search"}
            </span>
          </div>
          {user?.customClaims.level === 1 && (
            <Button
              label="Add New Lot"
              icon="pi pi-plus"
              severity="success"
              onClick={() => dispatch(setCreateModalVisible(true))}
              className="px-6 py-2.5 shadow-sm hover:shadow-md transition-all font-medium"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-green-500 to-green-600",
                },
                icon: { className: "mr-2" },
              }}
            />
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6">
          <DataTable
            value={lots}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: "60rem" }}
            selectionMode="single"
            onRowClick={(e) => dispatch(setSelectedLot(e.data as LotType))}
            emptyMessage={
              <div className="text-center py-8">
                <i className="pi pi-inbox text-gray-400 text-4xl mb-4" />
                <p className="text-gray-600">No parking lots found</p>
              </div>
            }
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} lots"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            globalFilter={globalFilterValue}
            globalFilterFields={["siteCode"]}
            pt={{
              wrapper: {
                className:
                  "overflow-hidden rounded-xl border-t border-gray-200",
              },
              thead: { className: "bg-gray-50" },
              paginator: {
                root: { className: "border-t border-gray-200 bg-gray-50" },
                pageButton: ({ context }: { context: any }) => ({
                  className: context.active
                    ? "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    : "hover:bg-gray-100 transition-colors",
                }),
              },
            }}
          >
            <Column
              field="siteCode"
              header="Lot Details"
              body={(rowData) => (
                <div className="flex flex-col py-2">
                  <span className="font-semibold text-gray-800">
                    {rowData.siteCode}
                  </span>
                  <span className="text-sm text-gray-600">
                    {rowData.address}
                  </span>
                </div>
              )}
            />
            <Column
              field="pApps"
              header="Payment Methods"
              body={(rowData) => (
                <div className="flex flex-wrap gap-1">
                  {rowData.pApps.map((app: string) => (
                    <Badge
                      key={app}
                      value={app}
                      severity="info"
                      className="px-2 py-1 text-xs font-medium rounded-full"
                    />
                  ))}
                </div>
              )}
            />
            <Column
              field="owners"
              header="Lot Owners"
              body={(rowData) => (
                <div className="flex flex-wrap gap-1">
                  {rowData.owners.map((owner: string) => (
                    <Tag
                      key={owner}
                      value={owner}
                      severity="success"
                      className="px-2 py-1 text-xs font-medium rounded-full"
                    />
                  ))}
                </div>
              )}
            />
            <Column
              field="createdAt"
              header="Created"
              body={(rowData) => (
                <div className="flex items-center gap-2">
                  <i className="pi pi-calendar text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(rowData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            />
          </DataTable>
        </div>
      </div>

      {selectedLot && <LotCard lot={selectedLot} />}

      <CreateLotDialog
        visible={isCreateModalVisible}
        onHide={() => dispatch(setCreateModalVisible(false))}
      />
    </div>
  );
};

export default LotComponent;
