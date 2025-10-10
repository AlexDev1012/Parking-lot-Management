import { ChangeEvent, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";
import { LprSessionType, ViolationLogType } from "../../types";
import { defaultViolationInfo } from "../../config";

const ViolationInfoCreate = ({
  selectedViolation,
  setSelectedViolation,
  handleResolved,
}: {
  selectedViolation: LprSessionType | null;
  setSelectedViolation: (value: LprSessionType | null) => void;
  handleResolved: (
    item: LprSessionType,
    violationInfo: ViolationLogType
  ) => void;
}) => {
  const [violationInfo, setViolationInfo] =
    useState<ViolationLogType>(defaultViolationInfo);

  const handleViolationInfo = (e: ChangeEvent<HTMLInputElement>) => {
    setViolationInfo({ ...violationInfo, [e.target.name]: e.target.value });
  };

  return (
    <Dialog
      header="Violation Information"
      visible={!!selectedViolation}
      style={{ width: "650px" }}
      onHide={() => setSelectedViolation(null)}
      footer={
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label="Cancel"
            className="p-button-text p-danger"
            onClick={() => setSelectedViolation(null)}
          />
          <Button
            label="Resolve"
            onClick={() => {
              if (selectedViolation && violationInfo)
                handleResolved(selectedViolation, violationInfo);
            }}
            className="p-button-primary p-success"
          />
        </div>
      }
    >
      <div className="flex p-4 flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name
            </label>
            <TextInput
              type="text"
              placeholder="Enter first name"
              name="firstName"
              value={violationInfo?.firstName}
              className="w-full"
              onChange={handleViolationInfo}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name
            </label>
            <TextInput
              type="text"
              placeholder="Enter last name"
              name="lastName"
              value={violationInfo?.lastName}
              className="w-full"
              onChange={handleViolationInfo}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <TextInput
              type="email"
              placeholder="Enter email"
              name="email"
              value={violationInfo?.email}
              className="w-full"
              onChange={handleViolationInfo}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <TextInput
              type="text"
              placeholder="Enter phone number"
              name="phoneNumber"
              value={violationInfo?.phoneNumber}
              className="w-full"
              onChange={handleViolationInfo}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Address
          </label>
          <TextInput
            type="text"
            placeholder="Enter address"
            name="address"
            value={violationInfo?.address}
            className="w-full"
            onChange={handleViolationInfo}
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
              value={violationInfo?.city}
              className="w-full"
              onChange={handleViolationInfo}
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
              value={violationInfo?.state}
              className="w-full"
              onChange={handleViolationInfo}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ZIP Code
            </label>
            <TextInput
              type="text"
              placeholder="ZIP"
              name="zipCode"
              value={violationInfo?.zipCode}
              className="w-full"
              onChange={handleViolationInfo}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ViolationInfoCreate;
