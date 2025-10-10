import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { CustomPriceType, LotType } from "../../types";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { showToast } from "../../utils";
import axios from "axios";
import moment from "moment";

const CustomPricesTable = ({
  lot,
  fetchLots,
  setCustomPrice,
  setIsRateOpen,
}: {
  lot: LotType;
  fetchLots: () => void;
  setCustomPrice: (customPrice: CustomPriceType) => void;
  setIsRateOpen: (isRateOpen: boolean) => void;
}) => {
  const renderActions = (item: CustomPriceType) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleEdit(item)}
        className="max-md:w-full px-4 py-2 bg-blue-500 text-white text-sm hover:opacity-80 transition-all ease-in-out rounded-md"
      >
        Edit
      </button>
      <button
        onClick={(e) =>
          confirmPopup({
            target: e.currentTarget,
            message: "Do you want to delete this record?",
            accept: () => handleDelete(item),
            reject: () => {},
            defaultFocus: "reject",
            acceptClassName: "p-danger",
          })
        }
        className="max-md:w-full px-4 py-2 bg-red-500 text-white text-sm hover:opacity-80 transition-all ease-in-out rounded-md"
      >
        Delete
      </button>
    </div>
  );

  const customDaysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDelete = async (item: CustomPriceType) => {
    try {
      await axios.put(`/lot/${lot._id}`, {
        customPrices: lot.customPrices.filter((v) => v._id !== item._id),
      });
      showToast("Custom Price deleted successfully", true);
      await fetchLots();
    } catch (error) {
      showToast("Error deleting Custom Price");
    }
  };

  const handleEdit = (item: CustomPriceType) => {
    setCustomPrice(item);
    setIsRateOpen(true);
  };

  return (
    <>
      <div className="p-2 bg-white rounded-lg w-full">
        <ConfirmPopup />
        <DataTable
          value={lot.customPrices}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "10rem" }}
          pt={{
            thead: { className: "text-[14px]" },
            paginator: {
              pageButton: ({ context }: { context: any }) => ({
                className: context.active
                  ? "bg-blue-500 text-white"
                  : undefined,
              }),
            },
          }}
        >
          <Column field="description" header="Price Name"></Column>
          <Column
            field="price"
            header="Price"
            body={(item: CustomPriceType) => `$${item.price}`}
          ></Column>
          <Column
            field="expirationDate"
            header="Expiration Date"
            body={(item: CustomPriceType) =>
              moment(item.expirationDate).format("YYYY-MM-DD")
            }
          ></Column>
          <Column
            header="Time Range"
            body={(item: CustomPriceType) =>
              `${item.rangeStart} - ${item.rangeEnd}`
            }
          ></Column>
          <Column
            field="activeDays"
            header="Active Days"
            body={(item: CustomPriceType) =>
              item.activeDays.map((day) => customDaysMap[day]).join(", ")
            }
          ></Column>
          <Column
            field="specificDate"
            header="Specific Date"
            body={(item: CustomPriceType) =>
              item.specificDate &&
              moment(item.specificDate).format("YYYY-MM-DD")
            }
          ></Column>
          <Column
            field="actions"
            header="Actions"
            style={{ width: "10%" }}
            body={renderActions}
          ></Column>
        </DataTable>
      </div>
    </>
  );
};

export default CustomPricesTable;
