import { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { getPortalItems, selectableYears } from "../config";
import { PortalItemType, LotType } from "../types";
import PortalComponent from "../components/PayingAppDashboard/PortalComponent";
import { useAppSelector, RootState, useAppDispatch } from "../redux/store";
import PaymentReport from "../components/PayingAppDashboard/PaymentReport";
import { pdf } from "@react-pdf/renderer";

import ReportModal from "../components/ReportModal";

import DatePicker, { DateObject } from "react-multi-date-picker";
import { Dropdown } from "primereact/dropdown";
import moment from "moment";
import { Button } from "primereact/button";
import { fetchPaidPortalStats } from "../redux/slice/statsReducer";
import axios from "axios";
import RevenueChart from "../components/RevenueChart";

const Dashboard = () => {
  const { lots } = useAppSelector((state: RootState) => state.app);
  const dispatch = useAppDispatch();

  const [selectedYear, setSelectedYear] = useState<{ year: number }>({
    year: moment().year(),
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedLots, setSelectedLots] = useState<LotType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortalItemType>(
    getPortalItems(moment().year())[0]
  );
  const [dateValues, setDateValues] = useState([
    new DateObject().subtract(10, "days"),
    new DateObject(),
  ]);

  useEffect(() => {
    if (lots.length > 0) {
      setSelectedLots(lots);
    }
  }, [lots]);

  useEffect(() => {
    if (selectedLots.length > 0) {
      dispatch(
        fetchPaidPortalStats({
          year: selectedYear.year,
          lotIds: selectedLots.map((lot) => lot._id),
        })
      );
    }
  }, [selectedLots, selectedYear]);

  const handleGenerateReport = async () => {
    if (!dateValues[0] || !dateValues[1] || selectedLots.length === 0) {
      return;
    }

    try {
      setReportLoading(true);
      const startDate = dateValues[0].toDate();
      const endDate = dateValues[1].toDate();
      const lotIds = selectedLots.map((lot) => lot._id);

      const { data } = await axios.post(`/statistics/payment-report`, {
        lotIds,
        startDate,
        endDate,
      });

      // Generate PDF
      const blob = await pdf(<PaymentReport data={data} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payment_Report_${dateValues[0]?.format(
        "YYYY-MM-DD"
      )}_to_${dateValues[1]?.format("YYYY-MM-DD")}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <i className="pi pi-chart-line text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Payment App Dashboard
                </h1>
                <p className="text-gray-600">
                  Monitor payment metrics and generate reports
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 sm:flex-initial">
              <Dropdown
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.value)}
                options={selectableYears}
                optionLabel="year"
                placeholder="Select a year"
                className="w-full sm:w-[180px]"
                pt={{
                  root: {
                    className:
                      "border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors",
                  },
                  panel: {
                    className: "rounded-xl shadow-xl border-0",
                  },
                  item: {
                    className: "hover:bg-blue-50 transition-colors py-2",
                  },
                  trigger: {
                    className: "p-2",
                  },
                }}
                valueTemplate={(option: { year: number }, props) => (
                  <div className="flex items-center gap-2 px-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <i className="pi pi-calendar text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">
                      {option?.year || props.placeholder}
                    </span>
                  </div>
                )}
              />
            </div>

            <div className="flex-1 sm:flex-initial">
              <MultiSelect
                value={selectedLots}
                options={lots}
                filter
                onChange={(e) => setSelectedLots(e.value)}
                optionLabel="siteCode"
                placeholder="Select Lots"
                className="w-full sm:w-[300px]"
                pt={{
                  root: {
                    className:
                      "border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors",
                  },
                  panel: {
                    className: "rounded-xl shadow-xl border-0",
                  },
                  item: {
                    className: "hover:bg-blue-50 transition-colors py-2",
                  },
                  trigger: {
                    className: "p-2",
                  },
                  header: {
                    className: "px-4 py-3 border-b border-gray-100",
                  },
                  filterInput: {
                    className:
                      "w-full rounded-lg border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-100",
                  },
                }}
                selectedItemsLabel={`${selectedLots.length} lots selected`}
                emptyFilterMessage={
                  <div className="text-center py-4">
                    <i className="pi pi-search text-gray-400 text-xl mb-2" />
                    <p className="text-gray-500">No matching lots found</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-min px-4">
            {getPortalItems(selectedYear.year).map((item, index) => (
              <div className="w-[300px] flex-shrink-0" key={index}>
                <PortalComponent
                  item={item}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Payment Reports
          </h2>
          <p className="text-sm text-gray-600">
            Generate and download payment reports
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          severity="info"
          className="px-4 py-2.5 shadow-sm hover:shadow-md transition-all"
          pt={{
            root: { className: "bg-gradient-to-r from-blue-500 to-blue-600" },
            icon: { className: "mr-2" },
          }}
        >
          <i className="pi pi-file-pdf mr-2" />
          Generate Report
        </Button>
      </div>

      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-file-pdf text-xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Generate Payment Report
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date Range
                </label>
                <DatePicker
                  range
                  value={dateValues}
                  onChange={setDateValues}
                  placeholder="Select date range"
                  className="w-full"
                  containerClassName="w-full"
                  inputClass="w-full h-11 px-4 rounded-xl border border-gray-200 shadow-sm 
                    focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Lots
                </label>
                <MultiSelect
                  value={selectedLots}
                  options={lots}
                  filter
                  onChange={(e) => setSelectedLots(e.value)}
                  optionLabel="siteCode"
                  placeholder="Select parking lots"
                  className="w-full"
                  pt={{
                    root: {
                      className: "border border-gray-200 rounded-xl shadow-sm",
                    },
                    panel: { className: "rounded-xl shadow-xl" },
                    item: { className: "hover:bg-blue-50" },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <Button
              icon="pi pi-times"
              label="Cancel"
              severity="secondary"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2"
              pt={{
                root: { className: "border border-gray-300 hover:bg-gray-100" },
              }}
            />
            <Button
              loading={reportLoading}
              icon="pi pi-download"
              label="Generate Report"
              severity="info"
              onClick={handleGenerateReport}
              className="px-4 py-2"
              pt={{
                root: {
                  className: "bg-gradient-to-r from-blue-500 to-blue-600",
                },
              }}
            />
          </div>
        </div>
      </ReportModal>

      <RevenueChart
        selectedItem={selectedItem}
        selectedLots={selectedLots}
        kind={1}
      />
    </div>
  );
};

export default Dashboard;
