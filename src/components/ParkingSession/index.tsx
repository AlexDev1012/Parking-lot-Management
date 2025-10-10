import { useEffect, useState, ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";

import HtmlTooltip from "../HtmlToolTip";
import { useAppSelector, useAppDispatch, RootState } from "../../redux/store";

import { LotType, LprSessionType, PaginationParams } from "../../types";

import {
  calculateParkingTime,
  calculateTotalAmount,
  showToast,
} from "../../utils";
import { TabView, TabPanel } from "primereact/tabview";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { MultiSelect } from "primereact/multiselect";

import moment from "moment";

import LprSessionTable from "./LprSessionTable";
import PaymentSessionTable from "./PaymentSessionTable";
import NonViolationTable from "./NonViolationTable";
import ViolationTable from "./ViolationTable";
import ErrorSessionTable from "./ErrorSessionTable";
import TicketPreview from "../TicketPreview";

import { setDriverInfo, setSessionInfo } from "../../redux/slice/appReducer";
import {
  fetchCurrentSessions,
  fetchPaymentSessions,
  fetchViolations,
  fetchNonViolations,
  fetchErrorSessions,
  setSelectedLots,
  setPLoading,
  handleParkingSessionUpdate,
  handleDriverInfoCreate,
  fetchResolvedViolations,
} from "../../redux/slice/psReducer";
import ParkerInfoEdit from "./ParkerInfoEdit";
import { defaultDriverInfo } from "../../config";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ParkingSession() {
  const dispatch = useAppDispatch();
  const { driverInfo, sessionInfo, lots } = useAppSelector(
    (state) => state.app
  );
  const {
    selectedLots,
    currentSessions,
    violations,
    nonViolations,
    resolvedViolations,
    paymentSessions,
    errorSessions,
  } = useAppSelector((state: RootState) => state.ps);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const [activeIndex, setActiveIndex] = useState<number>(
    user?.customClaims.level === 1 ? 0 : 2
  );
  const [plateNumber, setPlateNumber] = useState<string>("");

  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  console.log(activeIndex);

  const fetchCurrentTabData = ({
    page = 1,
    limit = 10,
    sortOrder = "desc",
  }: PaginationParams) => {
    const params = { page, limit, plateNumber, sortOrder };

    switch (activeIndex) {
      case 0:
        if (user?.customClaims.level === 1) {
          dispatch(fetchCurrentSessions(params));
        }
        break;
      case 1:
        if (user?.customClaims.level === 1) {
          dispatch(fetchPaymentSessions(params));
        }
        break;
      case 2:
        dispatch(fetchNonViolations(params));
        break;
      case 3:
        if (user?.customClaims.level === 1) {
          dispatch(fetchViolations(params));
        } else {
          dispatch(fetchResolvedViolations(params));
        }
        break;
      case 4:
        if (user?.customClaims.level === 1) {
          dispatch(fetchErrorSessions(params));
        }
        break;
    }
  };

  const handleLotSelection = (value: LotType[]) => {
    dispatch(setSelectedLots(value));
  };

  const handleVisible = (item: LprSessionType) => {
    dispatch(setSessionInfo(item));
    dispatch(setDriverInfo(item.driverInfo || defaultDriverInfo));
    setPreviewVisible(true);
  };

  const handleDriverInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setDriverInfo({ ...driverInfo, [e.target.name]: e.target.value }));
  };

  const accept = async () => {
    try {
      if (sessionInfo) {
        dispatch(
          handleParkingSessionUpdate({
            _id: sessionInfo._id,
            printedAt: moment().tz("America/New_York").format(),
          })
        );
        if (driverInfo) {
          dispatch(
            handleDriverInfoCreate({
              ...driverInfo,
              plateNumber: sessionInfo.plateNumber,
            })
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      fetchCurrentTabData({});
    }
  };

  const fetchImageFromBackend = async (
    imageUrl: string | undefined
  ): Promise<string> => {
    if (!imageUrl) return "";
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_PUBLIC_URL}/${imageUrl}`
      );
      if (!response.ok) throw new Error("Failed to fetch image");
      const imageBlob = await response.blob();
      return URL.createObjectURL(imageBlob);
    } catch (error) {
      console.error("Error fetching image:", error);
      return "";
    }
  };

  const updateImageElement = (elementId: string, imageUrl: string) => {
    const element = document.getElementById(elementId) as HTMLImageElement;
    if (element) element.src = imageUrl;
  };

  const generatePDFWithImage = async (input: HTMLElement) => {
    let vehicle1 = "",
      vehicle2 = "",
      plate1 = "",
      plate2 = "";

    try {
      dispatch(setPLoading(sessionInfo?._id || ""));
      // Load all images concurrently
      [vehicle1, vehicle2, plate1, plate2] = await Promise.all([
        sessionInfo?.vehicle1
          ? fetchImageFromBackend(sessionInfo?.vehicle1)
          : "",

        sessionInfo?.vehicle2
          ? fetchImageFromBackend(sessionInfo?.vehicle2)
          : "",
        sessionInfo?.plate1 ? fetchImageFromBackend(sessionInfo?.plate1) : "",
        sessionInfo?.plate2 ? fetchImageFromBackend(sessionInfo?.plate2) : "",
      ]);

      // Update all image elements
      updateImageElement("vehicle_1", vehicle1);
      updateImageElement("vehicle_2", vehicle2);
      updateImageElement("plate_1", plate1);
      updateImageElement("plate_2", plate2);

      // Wait for images to load
      await Promise.all([
        vehicle1 && waitForImageLoad("vehicle_1"),
        vehicle2 && waitForImageLoad("vehicle_2"),
        plate1 && waitForImageLoad("plate_1"),
        plate2 && waitForImageLoad("plate_2"),
      ]);

      // Add a small delay to ensure DOM updates are complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Rest of the PDF generation code remains the same
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const canvas = await html2canvas(input, {
        scale: 2,
        width: 210 * 4,
        height: 297 * 4,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      window.open(pdf.output("bloburi"), "_blank");

      confirmDialog({
        message: "Did you download or print the pdf file?",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        defaultFocus: "accept",
        accept,
        acceptClassName: "p-button-primary p-success",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF", false);
    } finally {
      dispatch(setPLoading(""));
      // Cleanup object URLs
      if (vehicle1) URL.revokeObjectURL(vehicle1);
      if (vehicle2) URL.revokeObjectURL(vehicle2);
      if (plate1) URL.revokeObjectURL(plate1);
      if (plate2) URL.revokeObjectURL(plate2);
    }
  };

  const waitForImageLoad = (elementId: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = document.getElementById(elementId) as HTMLImageElement;
      if (!img || img.complete) {
        resolve();
        return;
      }

      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve even on error to prevent hanging
    });
  };

  const handlePreview = async () => {
    if (!driverInfo?.name || !driverInfo?.address) {
      showToast("Please input name and address", false);
      return;
    }

    setPreviewVisible(false);
    const input = document.getElementById("content-to-print");
    if (!input) {
      showToast("Error generating preview PDF", false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    await generatePDFWithImage(input);
  };

  const cameraBody = (product: LprSessionType) => (
    <HtmlTooltip
      title={
        <div>
          <p>Entrance : {product.camera1 || "No Enterance"}</p>
          <p>Exit : {product.camera2 || "Currently Parking..."}</p>
        </div>
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        Camera URL
      </span>
    </HtmlTooltip>
  );

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
        style={{ width: "auto", maxWidth: "90vw" }}
        header="Image Preview"
        headerClassName="flex justify-center w-full"
        className="p-0"
        modal
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
    setPlateNumber("");
    if (selectedLots.length) {
      fetchCurrentTabData({});
    }
  }, [selectedLots, activeIndex, dispatch]);

  // Get the current active table's total count
  const getCurrentTableTotal = () => {
    switch (activeIndex) {
      case 0:
        return user?.customClaims.level === 1
          ? currentSessions.pagination.total
          : nonViolations.pagination.total;
      case 1:
        return paymentSessions.pagination.total;
      case 2:
        return nonViolations.pagination.total;
      case 3:
        return user?.customClaims.level === 1
          ? violations.pagination.total
          : resolvedViolations.pagination.total;
      case 4:
        return errorSessions.pagination.total;
      default:
        return 0;
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
                <i className="pi pi-car text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Sessions & Violations
              </h1>
            </div>
            <p className="text-gray-600">
              Monitor and manage parking sessions and violations across all
              locations
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
                  onKeyDown={(e) =>
                    e.key === "Enter" && fetchCurrentTabData({})
                  }
                  placeholder="Search by plate number"
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

      {/* Tabs and Content Section */}
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
          {user?.customClaims.level === 1 && (
            <TabPanel header="LPR Sessions" className="lpr-session">
              <LprSessionTable
                plateNumber={plateNumber}
                cameraBody={cameraBody}
                vehicleBody={vehicleBody}
                onPageChange={(page, limit) =>
                  fetchCurrentTabData({ page, limit })
                }
              />
            </TabPanel>
          )}
          {user?.customClaims.level === 1 && (
            <TabPanel header="Payment Sessions" className="paid-session">
              <PaymentSessionTable
                plateNumber={plateNumber}
                onPageChange={(page, limit) =>
                  fetchCurrentTabData({ page, limit })
                }
              />
            </TabPanel>
          )}
          <TabPanel header="Non-Violation" className="non-violation">
            <NonViolationTable
              plateNumber={plateNumber}
              onPageChange={(page, limit) =>
                fetchCurrentTabData({ page, limit })
              }
            />
          </TabPanel>

          <TabPanel header="Violations" className="violation">
            <ViolationTable
              plateNumber={plateNumber}
              reasonBody={reasonBody}
              vehicleBody={vehicleBody}
              handleVisible={handleVisible}
              onPageChange={(page, limit) =>
                fetchCurrentTabData({ page, limit })
              }
            />
          </TabPanel>

          {user?.customClaims.level === 1 && (
            <TabPanel header="Error" className="lpr-error">
              <ErrorSessionTable
                plateNumber={plateNumber}
                cameraBody={cameraBody}
                vehicleBody={vehicleBody}
                onPageChange={(page, limit) =>
                  fetchCurrentTabData({ page, limit })
                }
              />
            </TabPanel>
          )}
        </TabView>
      </div>

      <ParkerInfoEdit
        handleDriverInfoChange={handleDriverInfoChange}
        handlePreview={handlePreview}
        driverInfo={driverInfo}
        previewVisible={previewVisible}
        setPreviewVisible={setPreviewVisible}
      />

      <div className="h-0 overflow-hidden">
        <TicketPreview activeIndex={3} />
      </div>
    </div>
  );
}
