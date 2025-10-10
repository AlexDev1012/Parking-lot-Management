import { ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";
import { DriverInfoType } from "../../types";
import { useAppDispatch } from "../../redux/store";
import { handleDriverInfoUpdate } from "../../redux/slice/vsReducer";
import { defaultDriverInfo } from "../../config";

const ParkerInfoEdit = ({
  handleDriverInfo,
  editDriverInfo,
  setEditDriverInfo,
  fetchCurrentTabData,
}: {
  handleDriverInfo: (e: ChangeEvent<HTMLInputElement>) => void;
  editDriverInfo: DriverInfoType;
  setEditDriverInfo: (value: DriverInfoType) => void;
  fetchCurrentTabData: ({}) => void;
}) => {
  const dispatch = useAppDispatch();

  const handleDriverInfoChange = async () => {
    if (!editDriverInfo) return;
    await dispatch(handleDriverInfoUpdate(editDriverInfo)).unwrap();
    fetchCurrentTabData({});
    setEditDriverInfo(defaultDriverInfo);
  };

  return (
    <Dialog
      header="Parker Information"
      visible={!!editDriverInfo.plateNumber}
      style={{ width: "650px" }}
      onHide={() => {
        if (!editDriverInfo) return;
        setEditDriverInfo(defaultDriverInfo);
      }}
      footer={
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label="Cancel"
            className="p-button-text p-danger"
            onClick={() => setEditDriverInfo(defaultDriverInfo)}
          />
          <Button
            label="Update"
            onClick={handleDriverInfoChange}
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
            value={editDriverInfo?.name}
            className="w-full"
            onChange={handleDriverInfo}
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
            value={editDriverInfo?.address}
            className="w-full"
            onChange={handleDriverInfo}
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
              value={editDriverInfo?.city}
              className="w-full"
              onChange={handleDriverInfo}
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
              value={editDriverInfo?.state}
              className="w-full"
              onChange={handleDriverInfo}
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
              value={editDriverInfo?.zip}
              className="w-full"
              onChange={handleDriverInfo}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ParkerInfoEdit;
