import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { showToast } from "../../utils";
import { payingApps } from "../../config";
import { LocationType, PayingApp, UserType, ZoneType } from "../../types";
import { fetchLots } from "../../redux/slice/appReducer";

interface CreateLotDialogProps {
  visible: boolean;
  onHide: () => void;
}

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
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeAccountID: string;
  stripeWebhookKey: string;
}

const CreateLotDialog = ({ visible, onHide }: CreateLotDialogProps) => {
  const dispatch = useAppDispatch();

  const { users } = useAppSelector((state) => state.app);
  const { locations, zones } = useAppSelector((state) => state.lot);

  const [formData, setFormData] = useState<FormDataType>({
    locations: [],
    zone: null,
    siteCode: "",
    address: "",
    payTime: 15,
    firstFine: 75,
    secondFine: 85,
    thirdFine: 95,
    payingFee: 1.5,
    violationFee: 12,
    ticketThreshold: 3,
    percentage: 50,
    monthlyFee: 85,
    towEmail: "",
    stripePublicKey: "",
    stripeSecretKey: "",
    stripeAccountID: "",
    stripeWebhookKey: "",
    pApps: [],
    owners: [],
  });

  const [loading, setLoading] = useState(false);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
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
      if (!coverImage) {
        showToast("Please upload a cover image");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("cover", coverImage);

      // Append other form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "locations") {
          value.forEach((l: LocationType) => {
            formDataToSend.append("locations[]", l.locationId?.[0] || "");
          });
        } else if (key === "zone") {
          formDataToSend.append("zone", value ? value.Name?.[0] || "" : "");
        } else if (key === "pApps") {
          value.forEach((p: PayingApp) => {
            formDataToSend.append("pApps[]", p.name || "");
          });
        } else if (key === "owners") {
          value.forEach((owner: UserType) => {
            formDataToSend.append("owners[]", owner.email || "");
          });
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      await axios.post("/lot", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("Created a new lot successfully", true);
      dispatch(fetchLots());
      handleClose();
    } catch (error) {
      showToast("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      locations: [],
      pApps: [],
      owners: [],
      siteCode: "",
      address: "",
      zone: null,
      payTime: 15,
      firstFine: 75,
      secondFine: 85,
      thirdFine: 95,
      payingFee: 1.5,
      violationFee: 12,
      ticketThreshold: 3,
      percentage: 50,
      monthlyFee: 85,
      towEmail: "",
      stripePublicKey: "",
      stripeSecretKey: "",
      stripeAccountID: "",
      stripeWebhookKey: "",
    });
    setCoverImage(null);
    setImagePreview("");
    onHide();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={handleClose}
        className="p-button-text"
      />
      <Button
        loading={loading}
        label={loading ? "Creating..." : "Create"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        severity="success"
      />
    </div>
  );

  return (
    <Dialog
      header="Create New Parking Lot"
      visible={visible}
      onHide={handleClose}
      style={{ width: "80vw", maxWidth: "1200px" }}
      footer={footer}
      modal
      className="p-fluid"
    >
      <div className="grid grid-cols-2 gap-6 p-4">
        <div className="space-y-6">
          <div className="field">
            <label htmlFor="cover" className="font-medium mb-2 block">
              Cover Image*
            </label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              {imagePreview ? (
                <div className="relative w-full aspect-video mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    icon="pi pi-times"
                    className="absolute top-2 right-2 p-button-rounded p-button-danger p-button-text"
                    onClick={() => {
                      setCoverImage(null);
                      setImagePreview("");
                    }}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <i className="pi pi-image text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">
                    Drag and drop or click to upload
                  </p>
                </div>
              )}
              <input
                type="file"
                id="cover"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {!imagePreview && (
                <Button
                  label="Select Image"
                  icon="pi pi-upload"
                  onClick={() => document.getElementById("cover")?.click()}
                  className="mt-4 p-button-outlined"
                />
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="siteCode" className="font-medium mb-2 block">
              Site Code*
            </label>
            <InputText
              id="siteCode"
              value={formData.siteCode}
              onChange={(e) =>
                setFormData({ ...formData, siteCode: e.target.value })
              }
              placeholder="Enter site code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="field">
            <label htmlFor="address" className="font-medium mb-2 block">
              Address*
            </label>
            <InputText
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter lot address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="field">
            <label htmlFor="pApps" className="font-medium mb-2 block">
              Payment Apps*
            </label>
            <MultiSelect
              id="pApps"
              value={formData.pApps}
              onChange={(e) => setFormData({ ...formData, pApps: e.value })}
              options={payingApps}
              optionLabel="name"
              placeholder="Select payment apps"
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
              Lot Owners*
            </label>
            <MultiSelect
              id="owners"
              value={formData.owners}
              onChange={(e) => setFormData({ ...formData, owners: e.value })}
              options={users.filter((user) => user?.customClaims.level === 2)}
              optionLabel="displayName"
              placeholder="Select lot owners"
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
              T2 Locations*
            </label>
            <MultiSelect
              id="locations"
              value={formData.locations}
              onChange={(e) => setFormData({ ...formData, locations: e.value })}
              options={locations}
              optionLabel="locationName"
              placeholder="Select locations"
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
              placeholder="Select zone"
              className="w-full border border-gray-300 rounded-lg"
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
              placeholder="Enter tow email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="field">
            <label htmlFor="ticketThreshold" className="font-medium mb-2 block">
              Ticket Threshold
            </label>
            <InputNumber
              id="ticketThreshold"
              value={formData.ticketThreshold}
              onValueChange={(e) =>
                setFormData({ ...formData, ticketThreshold: e.value || 3 })
              }
              min={0}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

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
              mode="currency"
              currency="USD"
              min={0}
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
              mode="currency"
              currency="USD"
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
              suffix="%"
              min={0}
              max={100}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="field">
            <label htmlFor="stripePublicKey" className="font-medium mb-2 block">
              Stripe Public Key
            </label>
            <InputText
              id="stripePublicKey"
              value={formData.stripePublicKey}
              onChange={(e) =>
                setFormData({ ...formData, stripePublicKey: e.target.value })
              }
              placeholder="Enter Stripe public key"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="field">
            <label htmlFor="stripeSecretKey" className="font-medium mb-2 block">
              Stripe Secret Key
            </label>
            <InputText
              id="stripeSecretKey"
              value={formData.stripeSecretKey}
              onChange={(e) =>
                setFormData({ ...formData, stripeSecretKey: e.target.value })
              }
              placeholder="Enter Stripe secret key"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              type="password"
            />
          </div>

          <div className="field">
            <label htmlFor="stripeAccountID" className="font-medium mb-2 block">
              Stripe Account ID
            </label>
            <InputText
              id="stripeAccountID"
              value={formData.stripeAccountID}
              onChange={(e) =>
                setFormData({ ...formData, stripeAccountID: e.target.value })
              }
              placeholder="Enter Stripe account ID"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="field">
            <label
              htmlFor="stripeWebhookKey"
              className="font-medium mb-2 block"
            >
              Stripe Webhook Key
            </label>
            <InputText
              id="stripeWebhookKey"
              value={formData.stripeWebhookKey}
              onChange={(e) =>
                setFormData({ ...formData, stripeWebhookKey: e.target.value })
              }
              placeholder="Enter Stripe webhook key"
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateLotDialog;
