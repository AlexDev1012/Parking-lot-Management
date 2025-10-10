import { ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";
import { DriverInfoType } from "../../types";

const ParkerInfoEdit = ({
  driverInfo,
  previewVisible,
  handleDriverInfoChange,
  handlePreview,
  setPreviewVisible,
}: {
  driverInfo: DriverInfoType;
  previewVisible: boolean;
  handleDriverInfoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setPreviewVisible: (value: boolean) => void;
  handlePreview: () => void;
}) => {
  return (
    <Dialog
      header="Parker Information"
      visible={previewVisible}
      style={{ width: "650px" }}
      onHide={() => {
        if (!previewVisible) return;
        setPreviewVisible(false);
      }}
      footer={
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label="Cancel"
            className="p-button-text p-danger"
            onClick={() => setPreviewVisible(false)}
          />
          <Button
            label="Preview"
            onClick={handlePreview}
            className="p-button-primary p-success"
          />
        </div>
      }
    >
      <div className="flex p-4 flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <TextInput
            type="text"
            placeholder="Enter full name"
            name="name"
            value={driverInfo.name}
            className="w-full"
            onChange={handleDriverInfoChange}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Street Address
          </label>
          <TextInput
            type="text"
            placeholder="Enter street address"
            name="address"
            value={driverInfo.address}
            className="w-full"
            onChange={handleDriverInfoChange}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City
            </label>
            <TextInput
              type="text"
              placeholder="City"
              name="city"
              value={driverInfo.city}
              className="w-full"
              onChange={handleDriverInfoChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State
            </label>
            <TextInput
              type="text"
              placeholder="State"
              name="state"
              value={driverInfo.state}
              className="w-full"
              onChange={handleDriverInfoChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ZIP Code
            </label>
            <TextInput
              type="text"
              placeholder="ZIP"
              name="zip"
              value={driverInfo.zip}
              className="w-full"
              onChange={handleDriverInfoChange}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ParkerInfoEdit;
