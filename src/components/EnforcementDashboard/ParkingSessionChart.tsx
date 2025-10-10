/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BarChart, Card } from "@tremor/react";

import axios from "axios";

import { PortalItemType, LotType } from "../../types";

const ParkingSessionChart = ({
  selectedItem,
  selectedLots,
}: {
  selectedItem: PortalItemType;
  selectedLots: LotType[];
}) => {
  const [chartData, setChartData] = useState<
    {
      Date: string;
      Current: number;
      "Non-Violation": number;
      Violation: number;
      Mistake: number;
      Error: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/statistics/session-chart-data`, {
        selectedYear: selectedItem.period[0].getFullYear(),
        selectedPeriod: selectedItem.name,
        lotIds: selectedLots.map((lot) => lot._id),
      });
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
  }, [selectedItem, selectedLots]);

  // Calculate total for each category
  const categoryTotals = {
    Current: chartData.reduce((sum, item) => sum + item.Current, 0),
    "Non-Violation": chartData.reduce(
      (sum, item) => sum + item["Non-Violation"],
      0
    ),
    Violation: chartData.reduce((sum, item) => sum + item.Violation, 0),
    Mistake: chartData.reduce((sum, item) => sum + item.Mistake, 0),
    Error: chartData.reduce((sum, item) => sum + item.Error, 0),
  };

  // Sort categories by their totals
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            Total Records:
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium text-sm">
            {chartData.reduce(
              (sum, data) =>
                sum +
                data.Current +
                data["Non-Violation"] +
                data.Violation +
                data.Mistake +
                data.Error,
              0
            )}
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
              <p className="text-sm text-gray-500">Session Analysis</p>
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
              categories={sortedCategories}
              valueFormatter={(value: number) => value.toString()}
              showAnimation={true}
              showLegend={true}
              showGridLines={false}
              stack={true}
              className="h-72"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ParkingSessionChart;
