import { useAppSelector } from "../../redux/store";
import { PortalOnDashboardType } from "../../types";

const PortalOnDashboard: React.FC<PortalOnDashboardType> = ({
  item,
  selectedItem,
  setSelectedItem,
}) => {
  const { paidPortalStats } = useAppSelector((state) => state.stats);

  const getSessionCount = (): number => {
    if (paidPortalStats.isLoading) return 0;

    // If it's a year total (e.g., "2025")
    if (item.name.match(/^\d{4}$/)) {
      return Object.values(paidPortalStats.paymentSessions).reduce(
        (a, b) => a + b,
        0
      );
    }

    // If it's a specific month (e.g., "January 2025")
    const monthName = item.name.split(" ")[0];
    return paidPortalStats.paymentSessions[monthName] || 0;
  };

  return (
    <div
      className={`
        flex flex-col w-full gap-4 p-6 rounded-xl cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${
          selectedItem.name === item.name
            ? "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            : "bg-white border border-gray-200 hover:border-blue-200"
        }
      `}
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`
            p-3 rounded-xl
            ${
              selectedItem.name === item.name
                ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
                : "bg-gray-100"
            }
          `}
          >
            <i
              className={`pi pi-calendar text-lg
              ${
                selectedItem.name === item.name ? "text-white" : "text-gray-600"
              }
            `}
            />
          </div>
          <span className="font-semibold text-gray-800">{item.name}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
          <div className="p-2 bg-green-100 rounded-lg">
            <i className="pi pi-dollar text-green-600" />
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Payments</span>
            <p
              className={`font-semibold text-gray-800 ${
                paidPortalStats.isLoading ? "opacity-50" : ""
              }`}
            >
              {getSessionCount()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalOnDashboard;
