import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import { TextInput } from "@tremor/react";
import { showToast } from "../../../utils";
import { PaginationParams } from "../../../types";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../redux/store";
import {
  clearSearchResults,
  fetchByPlateNumberForLpr,
  fetchByPlateNumberForPayment,
  fetchByPlateNumberForPermit,
} from "../../../redux/slice/statsReducer";
import ParkingSessionTable from "./ParkingSessionTable";
import PaymentSessionTable from "./PaymentSessionTable";
import PermitTable from "./PermitTable";

const PlateSearch = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [plateSearch, setPlateSearch] = useState<string>("");
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const handlePlateSearch = async () => {
    if (!plateSearch) return;
    try {
      dispatch(fetchByPlateNumberForLpr({ plateNumber: plateSearch }));
      dispatch(fetchByPlateNumberForPayment({ plateNumber: plateSearch }));
      dispatch(fetchByPlateNumberForPermit({ plateNumber: plateSearch }));
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error fetching plate data:", error);
      showToast("Failed to fetch plate data", false);
    }
  };

  const fetchCurrentTabData = ({
    page = 1,
    limit = 10,
    sortOrder = "desc",
  }: PaginationParams) => {
    const params = { page, limit, plateNumber: plateSearch, sortOrder };

    switch (activeIndex) {
      case 0:
        dispatch(fetchByPlateNumberForLpr(params));
        break;
      case 1:
        dispatch(fetchByPlateNumberForPayment(params));
        break;
      case 2:
        dispatch(fetchByPlateNumberForPermit(params));
        break;
    }
  };

  return (
    <>
      <div className="flex flex-1 max-w-md gap-2">
        <div className="relative flex flex-1">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <TextInput
            value={plateSearch}
            onChange={(e) =>
              setPlateSearch(e.target.value.replace(/\s/g, "").toUpperCase())
            }
            placeholder="Search by plate number"
            className="pl-10 w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-l-lg shadow-sm text-gray-600"
            onKeyDown={(e) => e.key === "Enter" && handlePlateSearch()}
          />
        </div>
        <Button
          icon="pi pi-search"
          onClick={handlePlateSearch}
          disabled={!plateSearch}
          className="px-4 hover:shadow-md transition-all rounded-r-lg border-l-0"
          aria-label="Search"
          pt={{
            root: {
              className:
                "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
            },
            icon: {
              className: "text-white",
            },
          }}
        />
      </div>
      <Dialog
        visible={showSearchResults}
        onHide={() => {
          setShowSearchResults(false);
          setPlateSearch("");
          setActiveIndex(0);
          dispatch(clearSearchResults());
        }}
        header={`Search Results for Plate: ${plateSearch}`}
        modal
        style={{ width: "1600px" }}
        pt={{
          root: { className: "border-round-xl" },
          header: {
            className: "bg-gray-50 border-bottom-1 border-gray-200 py-3 px-4",
          },
          content: { className: "py-4 px-4" },
          footer: { className: "border-top-1 border-gray-200 py-3 px-4" },
        }}
      >
        <Accordion
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index as number)}
          pt={{
            root: { className: "border-none" },
          }}
        >
          {user?.customClaims.level === 1 && (
            <AccordionTab header="LPR Sessions">
              <ParkingSessionTable
                plateNumber={plateSearch}
                onPageChange={(page, limit) =>
                  fetchCurrentTabData({ page, limit })
                }
              />
            </AccordionTab>
          )}

          {user?.customClaims.level === 1 && (
            <AccordionTab header="Payment Sessions">
              <PaymentSessionTable
                plateNumber={plateSearch}
                onPageChange={(page, limit) =>
                  fetchCurrentTabData({ page, limit })
                }
              />
            </AccordionTab>
          )}

          <AccordionTab header="Permits">
            <PermitTable
              plateNumber={plateSearch}
              onPageChange={(page, limit) =>
                fetchCurrentTabData({ page, limit })
              }
            />
          </AccordionTab>
        </Accordion>
      </Dialog>
    </>
  );
};

export default PlateSearch;
