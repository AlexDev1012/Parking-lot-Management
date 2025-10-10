import { useEffect, useState, FC } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";

import { useAppSelector, useAppDispatch } from "../../redux/store";
import PermitsTable from "./PermitsTable";
import { LotType, PaginationParams } from "../../types";

import {
  fetchPermits,
  fetchValidations,
  setSelectedLots,
} from "../../redux/slice/pmReducer";
import CreatePermitDialog from "./CreatePermitDialog";
import { MultiSelect } from "primereact/multiselect";

interface PermitsProps {
  lot?: LotType;
}

const PermitsComponent: FC<PermitsProps> = ({ lot }) => {
  const dispatch = useAppDispatch();
  const { lots } = useAppSelector((state) => state.app);
  const { permits, validations, selectedLots } = useAppSelector(
    (state) => state.pm
  );

  const [activeTab, setActiveTab] = useState<number>(0);
  const [plateNumber, setPlateNumber] = useState("");

  const fetchCurrentTabData = (params: PaginationParams) => {
    switch (activeTab) {
      case 0:
        dispatch(fetchPermits(params));
        break;
      case 1:
        dispatch(fetchValidations(params));
        break;
    }
  };

  useEffect(() => {
    if (lot) {
      dispatch(setSelectedLots([lot]));
    } else if (lots.length > 0) {
      dispatch(setSelectedLots(lots));
    }
  }, [lot, lots]);

  useEffect(() => {
    setPlateNumber("");
    fetchCurrentTabData({});
  }, [activeTab]);

  const getCurrentTableTotal = () => {
    switch (activeTab) {
      case 0:
        return permits.pagination.total;
      case 1:
        return validations.pagination.total;
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-ticket text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Permits & Validations
              </h1>
            </div>
            <p className="text-gray-600">
              Manage parking permits and validations across all locations
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <i className="pi pi-list text-blue-600" />
              <span className="font-medium text-blue-700">
                {getCurrentTableTotal()}
              </span>
              <span className="text-blue-600">Records</span>
            </div>
            <Button
              icon="pi pi-refresh"
              onClick={() => fetchCurrentTabData({})}
              className="p-3 hover:shadow-md transition-all"
              severity="secondary"
              aria-label="Refresh"
            />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="flex gap-2">
              <div className="relative flex flex-1">
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <TextInput
                  value={plateNumber}
                  onChange={(e) =>
                    setPlateNumber(
                      e.target.value.replace(/\s/g, "").toUpperCase()
                    )
                  }
                  placeholder="Filter by Plate Number"
                  className="pl-10 w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                />
              </div>
              <Button
                icon="pi pi-search"
                onClick={() =>
                  fetchCurrentTabData({ plateNumber: plateNumber })
                }
                className="px-4 hover:shadow-md transition-all"
                aria-label="Search"
                pt={{
                  root: {
                    className: "bg-gradient-to-r from-blue-500 to-blue-600",
                  },
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MultiSelect
              value={selectedLots}
              options={lot ? [lot] : lots}
              filter
              disabled={!!lot}
              onChange={(e) => {
                dispatch(setSelectedLots(e.value));
              }}
              optionLabel="siteCode"
              placeholder="Select Lots"
              className="w-[300px]"
              pt={{
                root: {
                  className:
                    "border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors",
                },
                panel: {
                  className: "rounded-xl shadow-xl border border-gray-200",
                },
                header: { className: "px-4 py-3 border-b border-gray-100" },
                item: { className: "hover:bg-blue-50 transition-colors py-2" },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
          pt={{
            root: { className: "p-0" },
            nav: { className: "px-6 pt-4 border-b border-gray-200 gap-2" },
            inkbar: { className: "bg-blue-500" },
            navContent: { className: "p-0" },
          }}
        >
          <TabPanel
            header={
              <div className="flex items-center gap-2">
                <i className="pi pi-ticket" />
                <span>Permits</span>
              </div>
            }
            className="permits-tab"
          >
            <PermitsTable
              plateNumber={plateNumber}
              permits={permits}
              activeTab={activeTab}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
          <TabPanel
            header={
              <div className="flex items-center gap-2">
                <i className="pi pi-check-circle" />
                <span>Validations</span>
              </div>
            }
            className="validations-tab"
          >
            <PermitsTable
              plateNumber={plateNumber}
              permits={validations}
              activeTab={activeTab}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
        </TabView>
      </div>

      {/* Create Permit Dialog */}
      <CreatePermitDialog fetchCurrentTabData={fetchCurrentTabData} />
    </div>
  );
};

export default PermitsComponent;
