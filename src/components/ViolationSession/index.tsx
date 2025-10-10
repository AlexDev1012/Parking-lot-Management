import { ChangeEvent, useEffect, useState } from "react";
import {
  DriverInfoType,
  LotType,
  LprSessionType,
  PaginationParams,
} from "../../types";
import {
  calculateParkingTime,
  calculateTotalAmount,
  showToast,
} from "../../utils";

import { TabView, TabPanel } from "primereact/tabview";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TicketPreview from "../TicketPreview";

import moment from "moment";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import ViolationTable from "./ViolationTable";
import { useAppSelector, RootState, useAppDispatch } from "../../redux/store";
import { setDriverInfo, setSessionInfo } from "../../redux/slice/appReducer";
import {
  fetchDueViolations,
  fetchOverdueViolations,
  fetchRecentViolations,
  fetchResolvedViolations,
  fetchMistakeViolations,
  setSelectedLots,
  setPLoading,
} from "../../redux/slice/vsReducer";
import HtmlTooltip from "../HtmlToolTip";
import ParkerInfoEdit from "./ParkerInfoEdit";
import ParkingSessionEdit from "./ParkingSessionEdit";
import { TextInput } from "@tremor/react";
import { defaultDriverInfo } from "../../config";

export default function ViolationSessions() {
  const { lots } = useAppSelector((state) => state.app);
  const {
    selectedLots,
    recentViolations,
    dueViolations,
    overdueViolations,
    resolvedViolations,
    mistakeViolations,
  } = useAppSelector((state: RootState) => state.vs);
  const dispatch = useAppDispatch();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [editSessionInfo, setEditSessionInfo] = useState<LprSessionType | null>(
    null
  );
  const [editDriverInfo, setEditDriverInfo] =
    useState<DriverInfoType>(defaultDriverInfo);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plateNumber, setPlateNumber] = useState<string>("");

  const fetchCurrentTabData = ({
    page = 1,
    limit = 10,
    sortOrder = "desc",
  }: PaginationParams) => {
    const params = { page, limit, plateNumber, sortOrder };

    switch (activeIndex) {
      case 0:
        dispatch(fetchRecentViolations(params));
        break;
      case 1:
        dispatch(fetchDueViolations(params));
        break;
      case 2:
        dispatch(fetchOverdueViolations(params));
        break;
      case 3:
        dispatch(fetchResolvedViolations(params));
        break;
      case 4:
        dispatch(fetchMistakeViolations(params));
        break;
    }
  };

  // Get the current active table's total count
  const getCurrentTableTotal = () => {
    switch (activeIndex) {
      case 0:
        return recentViolations.pagination.total;
      case 1:
        return dueViolations.pagination.total;
      case 2:
        return overdueViolations.pagination.total;
      case 3:
        return resolvedViolations.pagination.total;
      case 4:
        return mistakeViolations.pagination.total;
      default:
        return 0;
    }
  };

  const handleLotSelection = (value: LotType[]) => {
    dispatch(setSelectedLots(value));
  };

  const handleDriverInfo = (e: ChangeEvent<HTMLInputElement>) => {
    setEditDriverInfo({
      ...editDriverInfo,
      [e.target.name]: e.target.value || "", // Ensure string value
    });
  };

  const handleSessionInfo = (e: ChangeEvent<HTMLInputElement>) => {
    if (!editSessionInfo) return;
    setEditSessionInfo({
      ...editSessionInfo,
      [e.target.name]: e.target.value || "", // Ensure string value
    });
  };

  const fetchImageFromBackend = async (
    imageUrl: string | undefined
  ): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_PUBLIC_URL}/${imageUrl}`
    );
    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  };

  const waitForImageLoad = (imgElement: HTMLImageElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (imgElement.complete) {
        // Image is already loaded
        resolve();
      } else {
        imgElement.onload = () => resolve();
        imgElement.onerror = () =>
          reject(new Error(`Failed to load image: ${imgElement.src}`));
      }
    });
  };

  const generateAndDownloadPDFForEachItem = async (items: LprSessionType[]) => {
    try {
      for (const item of items) {
        try {
          // Set the preview data and wait for state to update
          dispatch(setSessionInfo(item));
          dispatch(setDriverInfo(item.driverInfo || defaultDriverInfo));

          // Add this delay to ensure state updates are processed
          await new Promise((resolve) => setTimeout(resolve, 500));

          const input = document.getElementById("content-to-print");

          if (input) {
            // Load all images first before proceeding
            const imagesToLoad = [];

            if (item.vehicle1) {
              imagesToLoad.push({ url: item.vehicle1, id: "vehicle_1" });
            }
            if (item.plate1) {
              imagesToLoad.push({ url: item.plate1, id: "plate_1" });
            }
            if (item.vehicle2) {
              imagesToLoad.push({ url: item.vehicle2, id: "vehicle_2" });
            }
            if (item.plate2) {
              imagesToLoad.push({ url: item.plate2, id: "plate_2" });
            }

            // Load all images in parallel, continue even if some fail
            await Promise.allSettled(
              imagesToLoad.map(async ({ url, id }) => {
                try {
                  const imgUrl = await fetchImageFromBackend(url);
                  const element = document.getElementById(
                    id
                  ) as HTMLImageElement;
                  if (element) {
                    element.src = imgUrl;
                    await waitForImageLoad(element);
                  }
                } catch (error) {
                  console.error(`Failed to load image ${url}:`, error);
                  // Continue execution even if image fails to load
                }
              })
            );

            // Initialize jsPDF with A4 page format
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });

            // Capture the content
            const canvas = await html2canvas(input, {
              scale: 2,
              width: 210 * 4,
              height: 297 * 4,
              useCORS: true,
              logging: false,
              imageTimeout: 0,
            });

            const imgData = canvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            const kind =
              activeIndex === 0
                ? "recent"
                : activeIndex === 1
                ? "due"
                : activeIndex === 2
                ? "overdue"
                : activeIndex === 4
                ? "mistake"
                : "resolved";
            // Save PDF with unique filename
            const filename = `violation_${kind}_${item.plateNumber}_${moment()
              .tz("America/New_York")
              .format("YYYY.MM.DD")}.pdf`;
            pdf.save(filename);
          }
        } catch (itemError) {
          console.error(`Error processing item ${item._id}:`, itemError);
          // Continue with next item even if current one fails
          continue;
        }
      }
    } catch (error) {
      console.error("Error generating PDFs:", error);
      throw error;
    }
  };

  const handlePrint = async (items: LprSessionType[]) => {
    try {
      dispatch(setPLoading(true));
      await generateAndDownloadPDFForEachItem(items);
      showToast("PDFs downloaded successfully!", true);
    } catch (error) {
      showToast("Failed to generate PDFs.", false);
    } finally {
      dispatch(setPLoading(false));
    }
  };

  const vehicleBody = (product: LprSessionType) => (
    <>
      <HtmlTooltip
        title={
          <div className="flex gap-4">
            <div className="w-[50%]">
              <span className="text-xl text-black">(Entrance)</span>
              {product.vehicle1 ? (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.vehicle1
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.vehicle1
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.plate1
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.plate1
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                </div>
              ) : (
                <p>No Enterance</p>
              )}
            </div>
            <div className="w-[50%]">
              <span className="text-xl text-black">(Exit)</span>
              {product.vehicle2 ? (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.vehicle2
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.vehicle2
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                  <img
                    src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                      product.plate2
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(
                        `${import.meta.env.VITE_API_PUBLIC_URL}/${
                          product.plate2
                        }`
                      );
                    }}
                    className="cursor-pointer hover:opacity-80"
                  />
                </div>
              ) : (
                <p>Currently Parking...</p>
              )}
            </div>
          </div>
        }
      >
        <span className={`underline text-blue-500 cursor-pointer`}>
          (Entrance Exit)
        </span>
      </HtmlTooltip>

      {/* Image Preview Dialog */}
      <Dialog
        visible={!!selectedImage}
        onHide={() => setSelectedImage(null)}
        pt={{
          root: {
            className:
              "w-auto max-w-[90vw] rounded-2xl overflow-hidden shadow-2xl",
          },
          header: {
            className: "bg-gradient-to-r from-gray-50 to-white border-b p-6",
          },
          content: { className: "p-6 bg-gray-50" },
        }}
        header={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="pi pi-image text-xl text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              Image Preview
            </span>
          </div>
        }
      >
        <div className="flex justify-center items-center w-full">
          {selectedImage && (
            <img
              src={selectedImage}
              style={{ maxWidth: "100%", maxHeight: "90vh", minWidth: "30vw" }}
              alt="Preview"
            />
          )}
        </div>
      </Dialog>
    </>
  );

  const reasonBody = (product: LprSessionType) => (
    <HtmlTooltip
      title={
        product.status === "NOTFULL" ? (
          <div>
            <p>
              Parking :{" "}
              {product.entryTime &&
                product.exitTime &&
                calculateParkingTime(product.entryTime, product.exitTime)}
            </p>
            <p>Only Paid : ${calculateTotalAmount(product.paymentLogs)}</p>
          </div>
        ) : (
          <div>There was no paying</div>
        )
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        {product.status}
      </span>
    </HtmlTooltip>
  );

  useEffect(() => {
    dispatch(setSelectedLots(lots));
  }, [lots]);

  useEffect(() => {
    if (selectedLots.length) {
      setPlateNumber("");
      fetchCurrentTabData({});
    }
  }, [selectedLots, activeIndex, dispatch]);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-exclamation-circle text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Sessions & Violations
              </h1>
            </div>
            <p className="text-gray-600">
              Monitor and manage violation records across all locations
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
                onClick={() => fetchCurrentTabData({})}
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
              options={lots}
              filter
              onChange={(e) => handleLotSelection(e.value)}
              optionLabel="siteCode"
              placeholder="Select Lots"
              className="w-full md:w-[300px]"
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
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
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
                <i className="pi pi-clock" />
                <span>Recent</span>
              </div>
            }
            className="recent-violations"
          >
            <ViolationTable
              activeIndex={activeIndex}
              plateNumber={plateNumber}
              violations={recentViolations}
              vehicleBody={vehicleBody}
              reasonBody={reasonBody}
              setEditSessionInfo={setEditSessionInfo}
              setEditDriverInfo={setEditDriverInfo}
              handlePrint={handlePrint}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
          <TabPanel
            header={
              <div className="flex items-center gap-2">
                <i className="pi pi-calendar" />
                <span>Due</span>
              </div>
            }
            className="due-violations"
          >
            <ViolationTable
              activeIndex={activeIndex}
              plateNumber={plateNumber}
              violations={dueViolations}
              vehicleBody={vehicleBody}
              reasonBody={reasonBody}
              setEditSessionInfo={setEditSessionInfo}
              setEditDriverInfo={setEditDriverInfo}
              handlePrint={handlePrint}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
          <TabPanel
            header={
              <div className="flex items-center gap-2">
                <i className="pi pi-clock" />
                <span>Overdue</span>
              </div>
            }
            className="overdue-violations"
          >
            <ViolationTable
              activeIndex={activeIndex}
              plateNumber={plateNumber}
              violations={overdueViolations}
              vehicleBody={vehicleBody}
              reasonBody={reasonBody}
              setEditSessionInfo={setEditSessionInfo}
              setEditDriverInfo={setEditDriverInfo}
              handlePrint={handlePrint}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
          <TabPanel
            header={
              <div className="flex items-center gap-2">
                <i className="pi pi-check" />
                <span>Resolved</span>
              </div>
            }
            className="resolved-violations"
          >
            <ViolationTable
              activeIndex={activeIndex}
              plateNumber={plateNumber}
              violations={resolvedViolations}
              vehicleBody={vehicleBody}
              reasonBody={reasonBody}
              setEditSessionInfo={setEditSessionInfo}
              setEditDriverInfo={setEditDriverInfo}
              handlePrint={handlePrint}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
          <TabPanel
            header={
              <div className="flex items-center gap-2">
                <i className="pi pi-exclamation-circle" />
                <span>Mistake</span>
              </div>
            }
            className="mistake-violations"
          >
            <ViolationTable
              activeIndex={activeIndex}
              plateNumber={plateNumber}
              violations={mistakeViolations}
              vehicleBody={vehicleBody}
              reasonBody={reasonBody}
              setEditSessionInfo={setEditSessionInfo}
              setEditDriverInfo={setEditDriverInfo}
              handlePrint={handlePrint}
              fetchCurrentTabData={fetchCurrentTabData}
            />
          </TabPanel>
        </TabView>
      </div>

      <ParkerInfoEdit
        handleDriverInfo={handleDriverInfo}
        editDriverInfo={editDriverInfo}
        setEditDriverInfo={setEditDriverInfo}
        fetchCurrentTabData={fetchCurrentTabData}
      />

      <ParkingSessionEdit
        editSessionInfo={editSessionInfo}
        setEditSessionInfo={setEditSessionInfo}
        handleSessionInfo={handleSessionInfo}
        fetchCurrentTabData={fetchCurrentTabData}
      />

      {/* Hidden Ticket Preview */}
      <div className="h-0 overflow-hidden">
        <TicketPreview activeIndex={activeIndex} />
      </div>
    </div>
  );
}
