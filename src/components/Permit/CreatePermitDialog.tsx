import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TextInput } from "@tremor/react";
import { Dropdown } from "primereact/dropdown";
import { RootState, useAppDispatch, useAppSelector } from "../../redux/store";
import {
  createPermit,
  setCreateModalVisible,
} from "../../redux/slice/pmReducer";
import { LotType, PaginationParams } from "../../types";
import { showToast } from "../../utils";

export default function CreatePermitDialog({
  fetchCurrentTabData,
}: {
  fetchCurrentTabData: (params: PaginationParams) => void;
}) {
  const dispatch = useAppDispatch();
  const { isCreateModalVisible } = useAppSelector(
    (state: RootState) => state.pm
  );
  const { lots } = useAppSelector((state) => state.app);

  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    plate: "",
    lot: null as LotType | null,
  });

  const handleSubmit = async () => {
    if (!formData.reason) {
      showToast("Please input reason!");
      return;
    }

    if (!formData.plate) {
      showToast("Please input plate!");
      return;
    }

    if (!formData.lot) {
      showToast("Please select a lot!");
      return;
    }

    await dispatch(
      createPermit({
        ...formData,
        paidStatus: true,
        lot: formData.lot?._id,
      })
    ).unwrap();

    fetchCurrentTabData({});
    dispatch(setCreateModalVisible(false));
    setFormData({
      name: "",
      reason: "",
      plate: "",
      lot: null,
    });
  };

  return (
    <Dialog
      visible={isCreateModalVisible}
      onHide={() => dispatch(setCreateModalVisible(false))}
      header="Create New Permit"
      style={{ width: "650px" }}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={() => dispatch(setCreateModalVisible(false))}
            className="p-button-text p-danger"
          />
          <Button
            label="Create"
            icon="pi pi-check"
            onClick={handleSubmit}
            className="p-button-primary p-success"
            autoFocus
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <label>Name</label>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>Reason *</label>
          <TextInput
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Enter reason"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>Plate Number *</label>
          <TextInput
            value={formData.plate}
            onChange={(e) =>
              setFormData({
                ...formData,
                plate: e.target.value.toUpperCase(),
              })
            }
            placeholder="Enter plate number"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>Lot *</label>
          <Dropdown
            value={formData.lot}
            onChange={(e) => setFormData({ ...formData, lot: e.value })}
            options={lots}
            optionLabel="siteCode"
            placeholder="Select a lot"
            className="w-full border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </Dialog>
  );
}
