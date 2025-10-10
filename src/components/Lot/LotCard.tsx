import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Accordion, AccordionTab } from "primereact/accordion";
// import Permits from "../../pages/Permits";
import copy from "copy-to-clipboard";
import { Button as PrimeButton } from "primereact/button";
import { Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Dropdown } from "primereact/dropdown";
import { confirmDialog } from "primereact/confirmdialog";
import { MultiSelect } from "primereact/multiselect";
import { QRCodeSVG } from "qrcode.react";

import { showToast } from "../../utils";
import {
  CustomPriceType,
  LocationType,
  LotType,
  PayingApp,
  UserType,
  ZoneType,
} from "../../types";
// import ParkingSession from "./ParkingSession";
import { useAppSelector, RootState, useAppDispatch } from "../../redux/store";
import MyCalendar from "../MyCalendar";

import axios from "axios";
import { defaultZone, payingApps } from "../../config";
import ValidationsTable from "./VailationsTable";
import CustomPricesTable from "./CustomPricesTable";
import { setSelectedLot } from "../../redux/slice/lotReducer";
import { fetchLots } from "../../redux/slice/appReducer";
import PermitsComponent from "../Permit";

const defaultCustomPriceData: CustomPriceType = {
  activeDays: [],
  rangeStart: "",
  rangeEnd: "",
  specificDate: "",
  expirationDate: "",
  duration: 0,
  price: 0,
  description: "",
  detail: "",
};

const LotCard = ({ lot }: { lot: LotType }) => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { users } = useAppSelector((state) => state.app);
  const { locations, zones } = useAppSelector((state) => state.lot);
  const dispatch = useAppDispatch();

  const qrRef = useRef<HTMLDivElement | null>(null);

  const [pApps, setPApps] = useState<PayingApp[]>([]);
  const [lotOwners, setLotOwners] = useState<UserType[]>([]);
  const [editable, setEditable] = useState<boolean>(false);
  const [selectedLocations, setSelectedLocations] = useState<LocationType[]>(
    []
  );
  const [zone, setZone] = useState<ZoneType>(defaultZone);
  const [percentage, setPercentage] = useState<number[]>([50, 50]);
  // const [hourlyRate, setHourlyRate] = useState<number>(5);
  const [monthlyFee, setMonthlyFee] = useState<number>(0);
  const [payTime, setPayTime] = useState<number>(15);
  const [firstFine, setFirstFine] = useState<number>(75);
  const [secondFine, setSecondFine] = useState<number>(85);
  const [thirdFine, setThirdFine] = useState<number>(95);
  const [payingFee, setPayingFee] = useState<number>(1.5);
  const [violationFee, setViolationFee] = useState<number>(12);
  const [ticketThreshold, setTicketThreshold] = useState<number>(3);
  const [address, setAddress] = useState("");
  const [towEmail, setTowEmail] = useState("");
  // const [url, setUrl] = useState("");

  const [isRateOpen, setIsRateOpen] = useState<boolean>(false);

  const [customPrice, setCustomPrice] = useState<CustomPriceType>(
    defaultCustomPriceData
  );

  const handleClick = async () => {
    if (user?.customClaims.level === 1 && editable) {
      if (pApps.length === 0) {
        showToast("Please select Paying Apps!");
        return;
      }
      if (address.length === 0) {
        showToast("Please input lot address!");
        return;
      }
      if (Number.isNaN(payTime)) {
        showToast("Please input payment time correctly!");
        return;
      }
      if (Number.isNaN(firstFine)) {
        showToast("Please input fine correctly!");
        return;
      }
      if (Number.isNaN(secondFine)) {
        showToast("Please input fine correctly!");
        return;
      }
      if (Number.isNaN(thirdFine)) {
        showToast("Please input fine correctly!");
        return;
      }
      if (Number.isNaN(payingFee)) {
        showToast("Please input Paying App fee correctly!");
        return;
      }
      if (Number.isNaN(violationFee)) {
        showToast("Please input Violation App fee correctly!");
        return;
      }
      if (Number.isNaN(ticketThreshold)) {
        showToast("Please ticket threshold correctly!");
        return;
      }
      if (Number.isNaN(percentage[0])) {
        showToast("Please input percentage correctly!");
        return;
      }
      try {
        await axios.put(`/lot/${lot._id}`, {
          locations: selectedLocations.map((l) => l.locationId[0]),
          zone: zone ? zone.Name[0] : null,
          address,
          monthlyFee,
          payTime,
          firstFine,
          secondFine,
          thirdFine,
          payingFee,
          violationFee,
          ticketThreshold,
          towEmail,
          percentage: percentage[0],
          pApps: pApps.map((p) => p.name),
          owners: lotOwners.map((owner) => owner.email),
        });

        showToast("Updated a lot successfully", true);
      } catch (error) {
        showToast("Server error");
      }

      dispatch(fetchLots());
    } else if (editable) {
      // if (Number.isNaN(hourlyRate)) {
      //   showToast("Please input Paying App fee correctly!");
      //   return;
      // }

      if (Number.isNaN(monthlyFee)) {
        showToast("Please input Paying App fee correctly!");
        return;
      }
      if (Number.isNaN(payingFee)) {
        showToast("Please input Paying App fee correctly!");
        return;
      }
      if (Number.isNaN(violationFee)) {
        showToast("Please input Violation App fee correctly!");
        return;
      }
      try {
        await axios.put(`/lot/${lot._id}`, {
          // hourlyRate,
          monthlyFee,
          payingFee,
          violationFee,
        });
        showToast("Updated a lot successfully", true);
      } catch (error) {
        showToast("Server error");
      }
      await fetchLots();
    }
    setEditable(!editable);
  };

  const handleRemove = async () => {
    try {
      await axios.delete(`/lot/${lot._id}`);
      showToast("Deleted a lot successfully", true);
      dispatch(setSelectedLot(null));
    } catch (error) {
      showToast("Server error");
    } finally {
      dispatch(fetchLots());
    }
  };

  const handleDefaultValue = () => {
    lot.owners.length > 0 &&
      setLotOwners(
        users
          .filter((user) => user?.customClaims.level === 2)
          .filter((user) => lot.owners.includes(user.email))
      );
    setPercentage([lot.percentage, 100 - lot.percentage]);
    // setHourlyRate(lot.hourlyRate);
    lot.priceId &&
      axios
        .post(`/lot/price/`, { lotId: lot._id, priceId: lot.priceId })
        .then((res) => setMonthlyFee(res.data.unit_amount));
    setPayTime(lot.payTime);
    setFirstFine(lot.firstFine);
    setSecondFine(lot.secondFine);
    setThirdFine(lot.thirdFine);
    setPayingFee(lot.payingFee);
    setViolationFee(lot.violationFee);
    setTicketThreshold(lot.ticketThreshold);
    lot.towEmail && setTowEmail(lot.towEmail);
    // lot.url && setUrl(lot.url);
    lot.address && setAddress(lot.address);
    lot.locations &&
      setSelectedLocations(
        locations.filter((location) =>
          lot.locations.includes(location.locationId[0])
        )
      );
    lot.zone && setZone(zones.filter((zone) => zone.Name[0] === lot.zone)[0]);
    lot.pApps &&
      setPApps(payingApps.filter((app) => lot.pApps.includes(app.name)));
    setEditable(false);
  };

  const downloadQRCode = (siteCode: string) => {
    const svg = qrRef.current?.querySelector("svg");

    if (svg) {
      // Serialize the SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      // Create a blob from the SVG string
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      // Create an image element
      const img = new Image();
      img.onload = () => {
        // Define the padding size (in pixels)
        const padding = 5;

        // Create a canvas to draw the image
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          // Set the canvas size including padding
          canvas.width = svg.clientWidth + padding * 2; // Add padding to both sides
          canvas.height = svg.clientHeight + padding * 2; // Add padding to top and bottom

          // Fill the background with white (optional)
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the image onto the canvas with padding
          context.drawImage(img, padding, padding);

          // Convert canvas to PNG data URL
          const imageData = canvas.toDataURL("image/png");

          // Create a link to download the image
          const link = document.createElement("a");
          link.href = imageData;
          link.download = `${siteCode}_qr_code.png`;
          link.click();

          // Clean up
          URL.revokeObjectURL(url);
        }
      };
      img.src = url; // Set the source to trigger loading
    }
  };

  const handleCustomPriceChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setCustomPrice((prev) => {
      if (name === "activeDays") {
        const dayValue = Number(value);
        const updatedDays = prev.activeDays.includes(dayValue)
          ? prev.activeDays.filter((day) => day !== dayValue) // Remove the day if unchecked
          : [...prev.activeDays, dayValue]; // Add the day if checked
        return {
          ...prev,
          [name]: updatedDays,
        };
      } else {
        return {
          ...prev,
          [name]:
            name === "rate" || name === "duration" ? Number(value) : value,
        };
      }
    });
  };

  const handleCustomPriceCreate = async () => {
    if (
      !customPrice.description ||
      !customPrice.expirationDate ||
      !customPrice.rangeStart ||
      !customPrice.rangeEnd
    ) {
      showToast("Please input *fields");
    } else {
      try {
        await axios.put(`/lot/${lot._id}`, {
          customPrices: [...lot.customPrices, customPrice],
        });
        handleCustomPriceCancle();
        showToast("Custom Price created successfully", true);
        await fetchLots();
      } catch (error) {
        showToast("Error creating Custom Rate");
      }
    }
  };

  const handleCustomPriceUpdate = async () => {
    if (
      !customPrice.description ||
      !customPrice.expirationDate ||
      !customPrice.rangeStart ||
      !customPrice.rangeEnd
    ) {
      showToast("Please input *fields");
    } else {
      try {
        await axios.put(`/lot/${lot._id}`, {
          customPrices: lot.customPrices.map((v) =>
            v._id === customPrice._id ? customPrice : v
          ),
        });
        handleCustomPriceCancle();
        showToast("Custom Price updated successfully", true);
        await fetchLots();
      } catch (error) {
        showToast("Error updating Custom Rate");
      }
    }
  };

  const handleCustomPriceCancle = () => {
    setIsRateOpen(false);
    setCustomPrice(defaultCustomPriceData);
  };

  useEffect(() => {
    handleDefaultValue();
  }, [users, locations, zones]);

  return (
    <Dialog
      pt={{
        root: {
          className: "w-full md:w-[80vw]",
          style: { width: "", maxHeight: "80vh" },
        },
        header: { className: "p-2" },
      }}
      header={lot.siteCode}
      visible={!!lot}
      style={{ width: "50vw", maxHeight: "80vh" }}
      onHide={() => {
        dispatch(setSelectedLot(null));
        handleDefaultValue();
      }}
    >
      <div className="flex flex-col gap-2 w-full">
        <PrimeButton
          className="text-center w-full"
          onClick={handleClick}
          style={{ fontSize: 20 }}
        >
          <p className="text-center w-full">
            {editable ? "S a v e" : "E d i t"}
          </p>
        </PrimeButton>

        <div className="flex justiry-between gap-4">
          <div>
            <img
              className="w-32 rounded-md"
              src={`${import.meta.env.VITE_API_PUBLIC_URL}/${lot.cover}`}
            />
          </div>
          {user?.customClaims.level === 1 && (
            <div className="flex flex-col justify-between gap-4 w-full">
              <div className="flex flex-col">
                <p>Lot Owners :</p>
                <MultiSelect
                  value={lotOwners}
                  options={users.filter(
                    (user) => user.customClaims.level === 2
                  )}
                  disabled={!editable}
                  filter
                  onChange={(e) => {
                    setLotOwners(e.value);
                  }}
                  optionLabel="email"
                  pt={{
                    root: { className: "border border-black" },
                    checkbox: { className: "border border-black" },
                  }}
                  placeholder="Select Owners"
                  itemTemplate={(option) => {
                    return (
                      <div className="flex items-center gap-1">
                        <img
                          className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
                          src={
                            option.photoURL ||
                            `${
                              import.meta.env.VITE_API_BACKEND_URL
                            }public/user.png`
                          }
                        />
                        <div>{option.email}</div>
                      </div>
                    );
                  }}
                  className="flex-1 md:w-20rem text-xs"
                  display="chip"
                />
              </div>
              <div className="flex gap-1 items-end">
                <div
                  ref={qrRef}
                  className="border-solid border-2 border-black p-1 rounded-md"
                >
                  <QRCodeSVG
                    value={`https://cpmparking.com/${lot._id}`}
                    size={80}
                  />
                </div>
                <Button
                  onClick={() => downloadQRCode(lot.siteCode)}
                  size="small"
                  startIcon={<FileDownloadIcon />}
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
        <Accordion activeIndex={0} className="mt-4">
          {user?.customClaims.level === 1 && (
            <AccordionTab header="Lot Information">
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Paying App</span>
                <MultiSelect
                  value={pApps}
                  options={payingApps}
                  disabled={!editable}
                  filter
                  onChange={(e) => {
                    setPApps(e.value);
                  }}
                  optionLabel="name"
                  pt={{
                    root: { className: "border border-black" },
                    checkbox: { className: "border border-black" },
                  }}
                  placeholder="Select Paying Apps"
                  itemTemplate={(option) => {
                    return (
                      <div className="flex items-center gap-1">
                        <img
                          className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
                          src={option.url}
                        />
                        <div>{option.name}</div>
                      </div>
                    );
                  }}
                  className="w-full md:w-20rem"
                  display="chip"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">T2 Locations</span>
                <MultiSelect
                  value={selectedLocations}
                  options={locations}
                  disabled={!editable}
                  filter
                  onChange={(e) => {
                    setSelectedLocations(e.value);
                  }}
                  optionLabel="locationName"
                  pt={{
                    root: { className: "border border-black" },
                    checkbox: { className: "border border-black" },
                  }}
                  placeholder="Select T2 Locations"
                  itemTemplate={(option) => (
                    <div className="flex items-center gap-1">
                      <div>{option.locationName[0]}</div>
                    </div>
                  )}
                  className="w-full md:w-20rem"
                  display="chip"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Zone:</span>
                <Dropdown
                  value={zone} // Update selected value
                  options={zones} // Update options
                  disabled={!editable}
                  filter
                  onChange={(e) => setZone(e.value)} // Update onChange function
                  optionLabel="Name" // Update optionLabel to display the name of the zones data
                  placeholder="Select an enforcement Zone"
                  pt={{
                    root: { className: "border border-black" },
                  }}
                  itemTemplate={(option) => (
                    <div className="flex items-center gap-1">
                      <div>{option.Name[0]}</div>
                    </div>
                  )}
                  className="w-full md:w-20rem text-xs"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Enter Code:</span>
                <div className="relative w-full flex items-center border border-black rounded-md bg-black/5">
                  <button
                    onClick={() => {
                      copy(
                        `${import.meta.env.VITE_API_SENDER_URL}?token=${
                          lot.enterToken
                        }`
                      );
                      showToast("Copied to clipboard!", true);
                    }}
                    className="p-2 z-10 bg-[#f0f0f0] rounded-l-md border-r border-black hover:opacity-80 active:bg-orange-100 ease-in-out transition-all"
                  >
                    <svg width={20} height={20}>
                      <use href="#svg-copy" />
                    </svg>
                  </button>
                  <div className="absolute left-0 w-full overflow-x-auto pl-12 text-nowrap">{`${
                    import.meta.env.VITE_API_SENDER_URL
                  }?token=${lot.enterToken}`}</div>
                </div>
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Exit Code:</span>
                <div className="relative w-full flex items-center border border-black rounded-md bg-black/5">
                  <button
                    onClick={() => {
                      copy(
                        `${import.meta.env.VITE_API_SENDER_URL}?token=${
                          lot.exitToken
                        }`
                      );
                      showToast("Copied to clipboard!", true);
                    }}
                    className="p-2 z-10 bg-[#f0f0f0] rounded-l-md border-r border-black hover:opacity-80 active:bg-orange-100 ease-in-out transition-all"
                  >
                    <svg width={20} height={20}>
                      <use href="#svg-copy" />
                    </svg>
                  </button>
                  <div className="absolute left-0 w-full overflow-x-auto pl-12 text-nowrap">{`${
                    import.meta.env.VITE_API_SENDER_URL
                  }?token=${lot.exitToken}`}</div>
                </div>
              </div>
              {/* <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                  <span className="w-40">AnyDesk</span>
                  <input
                    onChange={(e) => setUrl(e.target.value)}
                    value={url}
                    disabled={!editable}
                    className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                    placeholder="AnyDesk Address"
                  />
                </div> */}
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Address:</span>
                <input
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  disabled={!editable}
                  className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="1300 DUVAL ST, KEY WEST"
                />
              </div>
            </AccordionTab>
          )}
          <AccordionTab header="Lot Rates">
            {/* <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Hourly Rate ( $ )</span>
                <input
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                  value={hourlyRate}
                  disabled={!editable}
                  min={0}
                  type="number"
                  className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Charge ammount per hour"
                />
              </div> */}
            <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
              <span className="w-40">Monthly Fee ( $ )</span>
              <input
                onChange={(e) => setMonthlyFee(parseInt(e.target.value, 10))}
                value={monthlyFee}
                disabled={!editable}
                min={0}
                type="number"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                placeholder="Monthly subscription fee"
              />
            </div>
            <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
              <span className="w-40">Paying Fee ( $ )</span>
              <input
                onChange={(e) => setPayingFee(parseFloat(e.target.value))}
                value={payingFee}
                min={0}
                disabled={!editable}
                type="number"
                className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                placeholder="Time for payment"
              />
            </div>
          </AccordionTab>
          {user?.customClaims.level === 1 && (
            <AccordionTab header="Admin Controls">
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Violation Fee ( $ )</span>
                <input
                  onChange={(e) => setViolationFee(parseFloat(e.target.value))}
                  value={violationFee}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Time for payment"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Leeway Time ( m )</span>
                <input
                  onChange={(e) => setPayTime(parseInt(e.target.value, 10))}
                  value={payTime}
                  disabled={!editable}
                  min={0}
                  type="number"
                  className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Time for payment"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Fine 1 ( $ )</span>
                <input
                  onChange={(e) => setFirstFine(parseInt(e.target.value, 10))}
                  value={firstFine}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Fine for violation"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Fine 2 ( $ )</span>
                <input
                  onChange={(e) => setSecondFine(parseInt(e.target.value, 10))}
                  value={secondFine}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Fine for violation"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Fine 3 ( $ )</span>
                <input
                  onChange={(e) => setThirdFine(parseInt(e.target.value, 10))}
                  value={thirdFine}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Fine for violation"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Ticket Threshold</span>
                <input
                  onChange={(e) => setTicketThreshold(parseInt(e.target.value))}
                  value={ticketThreshold}
                  min={0}
                  disabled={!editable}
                  type="number"
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="Time for payment"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start mb-4">
                <span className="w-40">Tow Email</span>
                <input
                  onChange={(e) => setTowEmail(e.target.value)}
                  value={towEmail}
                  disabled={!editable}
                  className="w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                  placeholder="example@towingcompany.com"
                />
              </div>
              <div className="flex items-center max-lg:flex-col max-lg:items-start">
                <span className="w-40">Percentage</span>
                <div className="flex justify-between col-span-3 w-full py-1 gap-10">
                  <div className="text-center">
                    <span className="w-40 mb-2">Super Admin ( % )</span>
                    <input
                      type="number"
                      onChange={(e) =>
                        +e.target.value <= 100 &&
                        +e.target.value >= 0 &&
                        setPercentage([
                          parseInt(e.target.value, 10),
                          100 - parseInt(e.target.value, 10),
                        ])
                      }
                      disabled={!editable}
                      value={percentage[0]}
                      className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                      placeholder="Super admin percentage for this lot"
                    />
                  </div>
                  <div className="text-center">
                    <span className="w-40 mb-2">End User ( % )</span>
                    <input
                      type="number"
                      disabled={!editable}
                      onChange={(e) =>
                        +e.target.value <= 100 &&
                        +e.target.value >= 0 &&
                        setPercentage([
                          100 - parseInt(e.target.value, 10),
                          parseInt(e.target.value, 10),
                        ])
                      }
                      value={percentage[1]}
                      className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic"
                      placeholder="End user percentage for this lot"
                    />
                  </div>
                </div>
              </div>
            </AccordionTab>
          )}
        </Accordion>
        {user?.customClaims.level === 1 && (
          <PrimeButton
            className="w-full min-w-[200px] text-center justify-center"
            onClick={() => {
              confirmDialog({
                message: "Do you want to delete this record?",
                header: "Delete Confirmation",
                icon: "pi pi-info-circle",
                defaultFocus: "reject",
                acceptClassName: "p-button-danger",
                accept: handleRemove,
                // reject
              });
            }}
          >
            Remove this lot
          </PrimeButton>
        )}
      </div>

      <div className="flex justify-center w-full mt-2 pt-2 border-solid border-t-2 border-slate-300">
        <PrimeButton
          className="w-1/6 bg-[#22cbad]"
          onClick={() => {
            setIsRateOpen(true);
          }}
        >
          <p className="text-center w-full">Add Custom Price</p>
        </PrimeButton>
      </div>

      {isRateOpen && (
        <div>
          <div className="flex justify-between border-solid border-b-2 border-slate-300 mb-4">
            <p>Custom Price</p>
            <p
              onClick={() => setIsRateOpen(false)}
              className="border px-3 py-1 rounded-full mb-1 cursor-pointer hover:bg-slate-400"
            >
              &times;
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col w-[25%] mb-2">
              <label htmlFor="description">Price Description*</label>
              <input
                onChange={handleCustomPriceChange}
                value={customPrice.description}
                type="text"
                name="description"
                placeholder="Sunday Price"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
            <div className="flex flex-col w-[25%] mb-2">
              <label htmlFor="expirationDate">Expiration Date*</label>
              <input
                value={customPrice.expirationDate}
                onChange={handleCustomPriceChange}
                type="date"
                name="expirationDate"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
            <div className="flex flex-col w-[25%] mb-2">
              <label htmlFor="price">Price ($)*</label>
              <input
                onChange={handleCustomPriceChange}
                value={customPrice.price}
                min={0}
                type="number"
                name="price"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
          </div>
          <div className="flex justify-between border-solid border-b-2 border-slate-300 pb-4">
            <div className="flex flex-col w-[20%] mb-2">
              <label htmlFor="rangeStart">Time Range Start*</label>
              <input
                onChange={handleCustomPriceChange}
                value={customPrice.rangeStart}
                type="time"
                name="rangeStart"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
            <div className="flex flex-col w-[20%] mb-2">
              <label htmlFor="rangeEnd">Time Range End*</label>
              <input
                onChange={handleCustomPriceChange}
                value={customPrice.rangeEnd}
                type="time"
                name="rangeEnd"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
            <div className="flex flex-col w-[20%] mb-2">
              <label htmlFor="duration">Duration (Hrs)*</label>
              <input
                onChange={handleCustomPriceChange}
                value={customPrice.duration}
                type="number"
                min={0}
                name="duration"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
            <div className="flex flex-col w-[20%] mb-2">
              <label htmlFor="specificDate">Specific Day</label>
              <input
                onChange={handleCustomPriceChange}
                value={customPrice.specificDate}
                type="date"
                name="specificDate"
                className="col-span-3 w-full outline-none px-4 py-1 border border-black rounded-md placeholder:italic mt-2"
              />
            </div>
          </div>
          <div className="py-4 border-b-2 mb-4">
            <p>Active Days:</p>
            <div className="flex justify-between">
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2 p-3"
                  type="checkbox"
                  name="activeDays"
                  id="Monday"
                  checked={customPrice.activeDays.includes(1)}
                  value={1}
                />
                <label htmlFor="Monday">Monday</label>
              </div>
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2"
                  type="checkbox"
                  name="activeDays"
                  id="Tuesday"
                  checked={customPrice.activeDays.includes(2)}
                  value={2}
                />
                <label htmlFor="Tuesday">Tuesday</label>
              </div>
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2"
                  type="checkbox"
                  name="activeDays"
                  id="Wednesday"
                  checked={customPrice.activeDays.includes(3)}
                  value={3}
                />
                <label htmlFor="Wednesday">Wednesday</label>
              </div>
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2"
                  type="checkbox"
                  name="activeDays"
                  id="Thursday"
                  checked={customPrice.activeDays.includes(4)}
                  value={4}
                />
                <label htmlFor="Thursday">Thursday</label>
              </div>
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2"
                  type="checkbox"
                  name="activeDays"
                  id="Friday"
                  checked={customPrice.activeDays.includes(5)}
                  value={5}
                />
                <label htmlFor="Friday">Friday</label>
              </div>
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2"
                  type="checkbox"
                  id="Saturday"
                  name="activeDays"
                  checked={customPrice.activeDays.includes(6)}
                  value={6}
                />
                <label htmlFor="Saturday">Saturday</label>
              </div>
              <div>
                <input
                  onChange={handleCustomPriceChange}
                  className="mr-2"
                  type="checkbox"
                  id="Sunday"
                  name="activeDays"
                  checked={customPrice.activeDays.includes(0)}
                  value={0}
                />
                <label htmlFor="Sunday">Sunday</label>
              </div>
            </div>
          </div>
          <label htmlFor="detail">Details</label>
          <textarea
            onChange={handleCustomPriceChange}
            name="detail"
            className="col-span-3 w-full p-2 outline-none border border-black rounded-md placeholder:italic mt-2 h-36 resize-none"
          />
          <div className="flex gap-4 mt-2">
            <Button
              onClick={
                customPrice._id
                  ? handleCustomPriceUpdate
                  : handleCustomPriceCreate
              }
              variant="contained"
              color="success"
            >
              {customPrice._id ? "Update" : "Create"}
            </Button>
            <Button
              onClick={handleCustomPriceCancle}
              variant="contained"
              color="error"
            >
              Cancle
            </Button>
          </div>
        </div>
      )}

      <Accordion activeIndex={0} className="mt-4">
        <AccordionTab header="Custom Prices">
          <CustomPricesTable
            lot={lot}
            fetchLots={fetchLots}
            setCustomPrice={setCustomPrice}
            setIsRateOpen={setIsRateOpen}
          />
        </AccordionTab>
        <AccordionTab header="Permits">
          <PermitsComponent lot={lot} />
        </AccordionTab>
        <AccordionTab header="Validations Permits">
          <ValidationsTable
            lot={lot}
            users={users.filter((user) => user.customClaims.level === 3)}
            fetchLots={fetchLots}
          />
        </AccordionTab>
        <AccordionTab header="Unenforcable Dates">
          <MyCalendar lotId={lot._id} />
        </AccordionTab>
      </Accordion>
    </Dialog>
  );
};

export default LotCard;
