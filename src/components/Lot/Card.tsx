import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setSelectedLot } from "../../redux/slice/lotReducer";
import { showToast } from "../../utils";
import { payingApps } from "../../config";
import { QRCodeSVG } from "qrcode.react";
import {
  LotType,
  LocationType,
  UserType,
  ZoneType,
  PayingApp,
} from "../../types";
import { fetchLots } from "../../redux/slice/appReducer";
// import { Accordion, AccordionTab } from "primereact/accordion";
// import CustomPricesTable from "./CustomPricesTable";
// import Permits from "./Permits";
// import ValidationsTable from "./ValidationsTable";
// import MyCalendar from "./MyCalendar";

interface FormDataType {
  locations: LocationType[];
  zone: ZoneType | null;
  pApps: PayingApp[];
  owners: UserType[];
  siteCode: string;
  address: string;
  payTime: number;
  firstFine: number;
  secondFine: number;
  thirdFine: number;
  payingFee: number;
  violationFee: number;
  ticketThreshold: number;
  percentage: number;
  monthlyFee: number;
  towEmail: string;
}

interface LotCardProps {
  lot: LotType;
}

const LotCard = ({ lot }: LotCardProps) => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.app);
  const { locations, zones } = useAppSelector((state) => state.lot);
  // const user = useAppSelector((state) => state.auth.user);
  const qrRef = useRef<HTMLDivElement | null>(null);
  const [editable, setEditable] = useState<boolean>(false);
  // const [isRateOpen, setIsRateOpen] = useState(false);

  // const [customPrice, setCustomPrice] = useState({
  //   description: "",
  //   expirationDate: "",
  //   price: "",
  //   rangeStart: "",
  //   rangeEnd: "",
  //   duration: "",
  //   specificDate: "",
  //   activeDays: [],
  //   detail: "",
  //   _id: "",
  // });

  const [formData, setFormData] = useState<FormDataType>({
    locations: [],
    zone: null,
    siteCode: lot.siteCode,
    address: lot.address,
    payTime: lot.payTime,
    firstFine: lot.firstFine,
    secondFine: lot.secondFine,
    thirdFine: lot.thirdFine,
    payingFee: lot.payingFee,
    violationFee: lot.violationFee,
    ticketThreshold: lot.ticketThreshold,
    percentage: lot.percentage,
    monthlyFee: 0,
    towEmail: lot.towEmail || "",
    pApps: [],
    owners: [],
  });

  const handleSubmit = async () => {
    try {
      if (formData.pApps.length === 0) {
        showToast("Please select Payment Apps");
        return;
      }
      if (!formData.address) {
        showToast("Please input lot address");
        return;
      }
      if (formData.owners.length === 0) {
        showToast("Please select lot owners");
        return;
      }

      await axios.put(`/lot/${lot._id}`, {
        ...formData,
        locations: formData.locations.map((l) => l.locationId?.[0] || ""),
        zone: formData.zone ? formData.zone.Name?.[0] : null,
        pApps: formData.pApps.map((p) => p.name),
        owners: formData.owners.map((owner) => owner.email),
      });

      showToast("Updated lot successfully", true);
      dispatch(fetchLots());
      setEditable(false);
    } catch (error) {
      showToast("Server error");
    }
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lot.siteCode}_qr_code.png`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    // Set initial values
    setFormData((prev) => ({
      ...prev,
      locations: locations.filter((location) =>
        lot.locations.includes(location.locationId[0])
      ),
      zone: zones.find((zone) => zone.Name[0] === lot.zone) || null,
      pApps: payingApps.filter((app) => lot.pApps.includes(app.name)),
      owners: users
        .filter((user) => user?.customClaims.level === 2)
        .filter((user) => lot.owners.includes(user.email)),
    }));
  }, [lot, locations, zones, users]);

  const footer = (
    <div className="flex justify-end gap-2">
      {editable ? (
        <>
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={() => setEditable(false)}
            className="p-button-text"
          />
          <Button
            label="Save"
            icon="pi pi-check"
            onClick={handleSubmit}
            severity="success"
          />
        </>
      ) : (
        <Button
          label="Edit"
          icon="pi pi-pencil"
          onClick={() => setEditable(true)}
        />
      )}
    </div>
  );

  return (
    <Dialog
      header={`Lot Details - ${lot.siteCode}`}
      visible={true}
      onHide={() => dispatch(setSelectedLot(null))}
      style={{ width: "80vw", maxWidth: "1200px" }}
      footer={footer}
      modal
      className="p-fluid"
    >
      <div className="flex flex-col gap-6">
        {/* Main Form Grid */}
        <div className="grid grid-cols-2 gap-6 p-4">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="field">
              <label className="font-medium mb-2 block">QR Code</label>
              <div
                ref={qrRef}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg bg-white"
              >
                <QRCodeSVG
                  value={`https://cpmparking.com/${lot._id}`}
                  size={200}
                />
                <Button
                  label="Download QR Code"
                  icon="pi pi-download"
                  onClick={downloadQRCode}
                  className="mt-4"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="siteCode" className="font-medium mb-2 block">
                Site Code
              </label>
              <InputText
                id="siteCode"
                value={formData.siteCode}
                onChange={(e) =>
                  setFormData({ ...formData, siteCode: e.target.value })
                }
                disabled={!editable}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="address" className="font-medium mb-2 block">
                Address
              </label>
              <InputText
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!editable}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="pApps" className="font-medium mb-2 block">
                Payment Apps
              </label>
              <MultiSelect
                id="pApps"
                value={formData.pApps}
                onChange={(e) => setFormData({ ...formData, pApps: e.value })}
                options={payingApps}
                optionLabel="name"
                disabled={!editable}
                display="chip"
                className="w-full"
                pt={{
                  root: { className: "border border-gray-300 rounded-lg" },
                  panel: { className: "shadow-lg" },
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="owners" className="font-medium mb-2 block">
                Lot Owners
              </label>
              <MultiSelect
                id="owners"
                value={formData.owners}
                onChange={(e) => setFormData({ ...formData, owners: e.value })}
                options={users.filter((user) => user?.customClaims.level === 2)}
                optionLabel="displayName"
                disabled={!editable}
                display="chip"
                className="w-full"
                pt={{
                  root: { className: "border border-gray-300 rounded-lg" },
                  panel: { className: "shadow-lg" },
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="locations" className="font-medium mb-2 block">
                Locations
              </label>
              <MultiSelect
                id="locations"
                value={formData.locations}
                onChange={(e) =>
                  setFormData({ ...formData, locations: e.value })
                }
                options={locations}
                optionLabel="locationName"
                disabled={!editable}
                display="chip"
                className="w-full"
                pt={{
                  root: { className: "border border-gray-300 rounded-lg" },
                  panel: { className: "shadow-lg" },
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="zone" className="font-medium mb-2 block">
                Zone
              </label>
              <Dropdown
                id="zone"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.value })}
                options={zones}
                optionLabel="Name"
                disabled={!editable}
                className="w-full border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="field">
              <label htmlFor="payTime" className="font-medium mb-2 block">
                Payment Time (minutes)
              </label>
              <InputNumber
                id="payTime"
                value={formData.payTime}
                onValueChange={(e) =>
                  setFormData({ ...formData, payTime: e.value || 15 })
                }
                disabled={!editable}
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="firstFine" className="font-medium mb-2 block">
                First Fine ($)
              </label>
              <InputNumber
                id="firstFine"
                value={formData.firstFine}
                onValueChange={(e) =>
                  setFormData({ ...formData, firstFine: e.value || 75 })
                }
                disabled={!editable}
                mode="currency"
                currency="USD"
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="secondFine" className="font-medium mb-2 block">
                Second Fine ($)
              </label>
              <InputNumber
                id="secondFine"
                value={formData.secondFine}
                onValueChange={(e) =>
                  setFormData({ ...formData, secondFine: e.value || 85 })
                }
                disabled={!editable}
                mode="currency"
                currency="USD"
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="thirdFine" className="font-medium mb-2 block">
                Third Fine ($)
              </label>
              <InputNumber
                id="thirdFine"
                value={formData.thirdFine}
                onValueChange={(e) =>
                  setFormData({ ...formData, thirdFine: e.value || 95 })
                }
                disabled={!editable}
                mode="currency"
                currency="USD"
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="payingFee" className="font-medium mb-2 block">
                Payment App Fee ($)
              </label>
              <InputNumber
                id="payingFee"
                value={formData.payingFee}
                onValueChange={(e) =>
                  setFormData({ ...formData, payingFee: e.value || 1.5 })
                }
                disabled={!editable}
                mode="currency"
                currency="USD"
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="violationFee" className="font-medium mb-2 block">
                Violation Fee ($)
              </label>
              <InputNumber
                id="violationFee"
                value={formData.violationFee}
                onValueChange={(e) =>
                  setFormData({ ...formData, violationFee: e.value || 12 })
                }
                disabled={!editable}
                mode="currency"
                currency="USD"
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label
                htmlFor="ticketThreshold"
                className="font-medium mb-2 block"
              >
                Ticket Threshold
              </label>
              <InputNumber
                id="ticketThreshold"
                value={formData.ticketThreshold}
                onValueChange={(e) =>
                  setFormData({ ...formData, ticketThreshold: e.value || 3 })
                }
                disabled={!editable}
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="percentage" className="font-medium mb-2 block">
                Super Admin Percentage (%)
              </label>
              <InputNumber
                id="percentage"
                value={formData.percentage}
                onValueChange={(e) =>
                  setFormData({ ...formData, percentage: e.value || 50 })
                }
                disabled={!editable}
                suffix="%"
                min={0}
                max={100}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="monthlyFee" className="font-medium mb-2 block">
                Monthly Fee ($)
              </label>
              <InputNumber
                id="monthlyFee"
                value={formData.monthlyFee}
                onValueChange={(e) =>
                  setFormData({ ...formData, monthlyFee: e.value || 85 })
                }
                disabled={!editable}
                mode="currency"
                currency="USD"
                min={0}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="field">
              <label htmlFor="towEmail" className="font-medium mb-2 block">
                Tow Email
              </label>
              <InputText
                id="towEmail"
                value={formData.towEmail}
                onChange={(e) =>
                  setFormData({ ...formData, towEmail: e.target.value })
                }
                disabled={!editable}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Additional Features Accordion */}
        {/* <div className="px-4">
          <Accordion activeIndex={0} className="mt-4">
            <AccordionTab
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-dollar" />
                  <span className="font-medium">Custom Prices</span>
                </div>
              }
            >
              <CustomPricesTable
                lot={lot}
                fetchLots={fetchLots}
                setCustomPrice={setCustomPrice}
                setIsRateOpen={setIsRateOpen}
              />
            </AccordionTab>

            <AccordionTab
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-ticket" />
                  <span className="font-medium">Permits</span>
                </div>
              }
            >
              <Permits lotId={lot._id} />
            </AccordionTab>

            <AccordionTab
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-check-circle" />
                  <span className="font-medium">Validations Permits</span>
                </div>
              }
            >
              <ValidationsTable
                lot={lot}
                users={users.filter((user) => user.customClaims.level === 3)}
                fetchLots={fetchLots}
              />
            </AccordionTab>

            <AccordionTab
              header={
                <div className="flex items-center gap-2">
                  <i className="pi pi-calendar-times" />
                  <span className="font-medium">Unenforceable Dates</span>
                </div>
              }
            >
              <MyCalendar lotId={lot._id} />
            </AccordionTab>
          </Accordion>
        </div> */}
      </div>
    </Dialog>
  );
};

export default LotCard;
