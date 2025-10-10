import { useEffect, useState, FC } from "react";
import { generateToken, showToast } from "../utils";
import { useAppSelector, RootState } from "../redux/store";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { LotType, ValidationType } from "../types";
import { QRCodeSVG } from "qrcode.react";

import axios from "axios";
import moment from "moment";

const ValidationPermits: FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [lot, setLot] = useState<LotType>();
  const [validation, setValidation] = useState<ValidationType>({
    user: "",
    duration: 0,
    price: 0,
  });
  const [token, setToken] = useState<string | undefined>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [plate, setPlate] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleCreate = async () => {
    if (!plate) {
      showToast("Please Input a Plate Number");
      return;
    }
    if (validation.duration === 0) {
      showToast("Please Select a Validation Permit");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/permit/create", {
        createdBy: user?.email,
        reason: "Validation",
        plate: plate,
        startDate: moment().tz("America/New_York"),
        endDate: moment()
          .add(validation.duration, "hours")
          .tz("America/New_York"),
        lot: lot?._id,
        paidStatus: validation.price === 0,
      });

      if (validation.price === 0) {
        setShowSuccess(true);
        setPlate("");
        setValidation({ user: "", duration: 0, price: 0 });
      } else {
        const generatedToken = await generateToken(
          { plate, ...validation, lot: lot?._id, permit: data._id },
          "1h"
        );
        setToken(generatedToken);
        setVisible(true);
      }
    } catch (error) {
      showToast("Failed to create permit", false);
    }
    setLoading(false);
  };

  const fetchLot = async () => {
    try {
      const { data } = await axios.get<LotType>(`/lot`);
      setLot(data);
    } catch (error) {
      showToast("Failed to fetch lots");
    }
  };

  useEffect(() => {
    fetchLot();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <i className="pi pi-ticket text-xl text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Validation Permits
            </h1>
            <p className="text-gray-600">
              Create and manage validation permits for parking access
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          {/* Plate Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Plate Number
            </label>
            <div className="relative">
              <i className="pi pi-car absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <InputText
                onChange={(e) => setPlate(e.target.value)}
                value={plate}
                name="plate"
                placeholder="Enter plate number"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Validation Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Validation Type
            </label>
            <Dropdown
              value={validation}
              onChange={(e) => setValidation(e.target.value)}
              options={lot?.validations.filter((v) => v.user === user?.email)}
              optionLabel="duration"
              placeholder="Select validation type"
              className="w-full"
              valueTemplate={(option: ValidationType, props) => {
                if (option) {
                  return (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <i className="pi pi-clock text-gray-500" />
                        <span>{option.duration} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="pi pi-dollar text-gray-500" />
                        <span>{option.price}</span>
                      </div>
                    </div>
                  );
                }
                return <span>{props.placeholder}</span>;
              }}
              itemTemplate={(option: ValidationType) => (
                <div className="flex justify-between items-center p-2 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-clock text-gray-500" />
                    <span>{option.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="pi pi-dollar text-gray-500" />
                    <span>{option.price}</span>
                  </div>
                </div>
              )}
              pt={{}}
            />
          </div>

          {/* Create Button */}
          <div className="flex justify-end pt-4">
            <Button
              loading={loading}
              onClick={handleCreate}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <i className="pi pi-plus" />
              Create Permit
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog
        header="Validation QR Code"
        visible={visible}
        onHide={() => {
          setVisible(false);
          setToken("");
        }}
        className="w-[90vw] max-w-[500px]"
      >
        <div className="flex flex-col items-center gap-6 p-4">
          {token && (
            <>
              <QRCodeSVG
                value={`https://cpmparking.com/permit/${token}`}
                size={300}
                className="p-4 bg-white rounded-lg shadow-md"
              />
              <p className="text-gray-600 text-center">
                Scan this QR code to validate your parking permit
              </p>
            </>
          )}
        </div>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        className="w-[90vw] max-w-[500px]"
        header="Permit Created Successfully"
        headerClassName="text-center text-xl font-semibold text-green-600"
      >
        <div className="flex flex-col items-center gap-6 p-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <i className="pi pi-check text-5xl text-green-500" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Free Validation Permit Created
            </h2>
            <p className="text-gray-600">
              The validation permit for plate number{" "}
              <span className="font-semibold">{plate}</span> has been
              successfully created and activated.
            </p>
          </div>
          <Button
            label="Done"
            icon="pi pi-check"
            onClick={() => setShowSuccess(false)}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ValidationPermits;
