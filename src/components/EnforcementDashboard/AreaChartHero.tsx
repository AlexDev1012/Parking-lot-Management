import { useEffect } from "react";
import {
  // AreaChart,
  Card,
} from "@tremor/react";
import {
  LprSessionType,
  PaymentSessionType,
  PortalItemType,
} from "../../types";

// interface ChartDataType {
//   Date: string;
//   LprSessions: number;
//   PaymentSessions: number;
// }

const AreaChartHero = ({
  lprSessions,
  paymentSessions,
  selectedItem,
}: {
  lprSessions: LprSessionType[];
  paymentSessions: PaymentSessionType[];
  selectedItem: PortalItemType;
}) => {
  // const [chartData, setChartData] = useState<ChartDataType[]>([]);

  // const makeChartData = () => {
  //   return selectedItem.items.map((item) => {
  //     const LprSessions = lprSessions.filter((vs) => {
  //       const sessionTime = new Date(vs.entryTime || vs.exitTime || "");
  //       return item.period[0] <= sessionTime && sessionTime <= item.period[1];
  //     }).length;

  //     const PaymentSessions = paymentSessions.filter((ps) => {
  //       const sessionTime = new Date(ps.purchasedDate);
  //       return item.period[0] <= sessionTime && sessionTime <= item.period[1];
  //     }).length;

  //     return {
  //       Date: item.name,
  //       LprSessions,
  //       PaymentSessions,
  //     };
  //   });
  // };

  useEffect(() => {
    // setChartData(makeChartData());
  }, [lprSessions, paymentSessions, selectedItem]);

  return (
    <Card className="w-full p-4 pt-0 border-l-4 border-yellow-500">
      <div className="flex flex-col items-center justify-between">
        <div className="flex gap-2 justify-between items-center mt-2 w-[100%]">
          <h3 className="font-medium text-tremor-content-strong/50 dark:text-dark-tremor-content-strong">
            {selectedItem.name}
          </h3>
          <h3 className="font-medium text-tremor-content-strong/50 dark:text-dark-tremor-content-strong">
            LPR & Paying
          </h3>
          <span className="text-xl text-green-400"></span>
        </div>
        {/* <AreaChart
          data={chartData}
          index="Date"
          categories={["LprSessions", "PaymentSessions"]}
          valueFormatter={(number: number) =>
            `${Intl.NumberFormat("us").format(number).toString()}`
          }
        /> */}
      </div>
    </Card>
  );
};

export default AreaChartHero;
