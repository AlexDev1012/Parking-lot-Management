/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BarChart, Card } from "@tremor/react";
import { Dropdown } from "primereact/dropdown";

import axios from "axios";

import { PortalItemType, LotType } from "../types";
import { useAppSelector, RootState } from "../redux/store";
import { chartFlags, ChartFlagType } from "../config";

const RevenueChart = ({
  selectedItem,
  selectedLots,
  kind,
}: {
  selectedItem: PortalItemType;
  selectedLots: LotType[];
  kind: number;
}) => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [graphFlag, setGraphFlag] = useState<ChartFlagType>(
    chartFlags[user?.customClaims.level === 1 ? 0 : 1]
  );
  const [chartData, setChartData] = useState<
    { Date: string; Revenue: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const dataFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number)}`;

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `/statistics/${kind === 0 ? "parking-chart-data" : "paid-chart-data"}`,
        {
          selectedYear: selectedItem.period[0].getFullYear(),
          selectedPeriod: selectedItem.name,
          lotIds: selectedLots.map((lot) => lot._id),
          graphFlag: graphFlag.value,
        }
      );

      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLots.length > 0) {
      fetchChartData();
    }
  }, [selectedItem, selectedLots, graphFlag]);

  const customTooltip = ({ payload, active }: any) => {
    if (!active || !payload?.[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <i className="pi pi-calendar text-blue-500" />
            <span className="font-semibold text-gray-800">{data.Date}</span>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <i className="pi pi-dollar text-blue-600 text-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Revenue</span>
                <span className="font-medium text-gray-800">
                  {dataFormatter(data.Revenue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <i className="pi pi-check-circle text-green-600 text-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Total Payments</span>
                <span className="font-medium text-gray-800">
                  {data.Count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="w-[250px]">
          <Dropdown
            value={graphFlag}
            onChange={(e) => setGraphFlag(chartFlags[e.value])}
            options={chartFlags}
            optionLabel="flag"
            placeholder="Select revenue type"
            className="w-full"
            pt={{
              root: {
                className:
                  "border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors",
              },
              panel: {
                className: "rounded-xl shadow-xl border-0 mt-2",
              },
              item: {
                className: "hover:bg-blue-50 transition-colors py-2.5 px-3",
              },
              trigger: {
                className: "p-2.5",
              },
            }}
            valueTemplate={() => (
              <div className="flex items-center gap-2 px-1">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <i
                    className={`pi ${
                      graphFlag.value === 0
                        ? "pi-dollar"
                        : graphFlag.value === 1
                        ? "pi-check-circle"
                        : "pi-exclamation-circle"
                    } text-blue-600 text-sm`}
                  />
                </div>
                <span className="font-medium text-gray-700">
                  {graphFlag.flag}
                </span>
              </div>
            )}
            itemTemplate={(option: ChartFlagType) => (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <i
                    className={`pi ${
                      option.value === 0
                        ? "pi-dollar"
                        : option.value === 1
                        ? "pi-check-circle"
                        : "pi-exclamation-circle"
                    } text-blue-600 text-sm`}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700">
                    {option?.flag}
                  </span>
                  <span className="text-xs text-gray-500">
                    {option?.value === 0
                      ? "View total commission"
                      : option.value === 1
                      ? "View CPA revenue"
                      : "View lot revenue"}
                  </span>
                </div>
              </div>
            )}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            Total Records:
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium text-sm">
            {chartData.filter((data) => data.Revenue > 0).length}
          </span>
        </div>
      </div>

      <Card className="w-full" decoration="top" decorationColor="blue">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-4 pt-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-700">
                {selectedItem.name}
              </h3>
              <p className="text-sm text-gray-500">
                Revenue Analysis for {graphFlag.flag}
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <i className="pi pi-spin pi-spinner" />
                <span className="text-sm">Loading data...</span>
              </div>
            )}
          </div>

          <div className="px-4 pb-4">
            <BarChart
              data={chartData}
              index="Date"
              categories={["Revenue"]}
              colors={["blue"]}
              valueFormatter={dataFormatter}
              showAnimation={true}
              showLegend={false}
              showGridLines={false}
              showYAxis={true}
              className="h-72"
              customTooltip={customTooltip}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RevenueChart;
