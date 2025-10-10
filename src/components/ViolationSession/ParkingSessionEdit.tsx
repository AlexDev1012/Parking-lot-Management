import { ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { useAppDispatch } from "../../redux/store";
import { handleParkingSessionUpdate } from "../../redux/slice/vsReducer";
import moment from "moment";
import { LprSessionType } from "../../types";

const ParkingSessionEdit = ({
  editSessionInfo,
  setEditSessionInfo,
  handleSessionInfo,
  fetchCurrentTabData,
}: {
  editSessionInfo: LprSessionType | null;
  setEditSessionInfo: (value: LprSessionType | null) => void;
  handleSessionInfo: (e: ChangeEvent<HTMLInputElement>) => void;
  fetchCurrentTabData: ({}) => void;
}) => {
  const dispatch = useAppDispatch();

  const handleParkingSessionChange = async () => {
    if (!editSessionInfo) return;
    setEditSessionInfo(null);
    await dispatch(
      handleParkingSessionUpdate({
        _id: editSessionInfo._id,
        plateNumber: editSessionInfo.plateNumber,
        country: editSessionInfo.country,
        entryTime: editSessionInfo.entryTime || "",
        exitTime: editSessionInfo.exitTime || "",
        fine: editSessionInfo.fine || 0,
      })
    ).unwrap();
    fetchCurrentTabData({});
  };

  return (
    <Dialog
      visible={!!editSessionInfo}
      onHide={() => setEditSessionInfo(null)}
      header="Parking Session"
      className="w-[90vw] md:w-[50vw]"
      footer={
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            label="Cancel"
            severity="secondary"
            onClick={() => setEditSessionInfo(null)}
            className="p-button-text p-danger"
          />
          <Button
            label="Update"
            severity="info"
            onClick={handleParkingSessionChange}
            className="p-button-primary p-success"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Plate Number
          </label>
          <InputText
            className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            name="plateNumber"
            value={editSessionInfo?.plateNumber}
            onChange={handleSessionInfo}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Country</label>
          <InputText
            className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            name="country"
            value={editSessionInfo?.country}
            onChange={handleSessionInfo}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Entry Time
          </label>
          <InputText
            type="datetime-local"
            className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            name="entryTime"
            value={moment(editSessionInfo?.entryTime).format(
              "YYYY-MM-DDTHH:mm"
            )}
            onChange={handleSessionInfo}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Exit Time</label>
          <InputText
            type="datetime-local"
            className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            name="exitTime"
            value={moment(editSessionInfo?.exitTime).format("YYYY-MM-DDTHH:mm")}
            onChange={handleSessionInfo}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Fine</label>
          <InputNumber
            className="p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            mode="currency"
            currency="USD"
            min={0}
            value={editSessionInfo?.fine}
            name="fine"
            onChange={(e) => {
              if (editSessionInfo) {
                setEditSessionInfo({
                  ...editSessionInfo,
                  fine: e.value || 0,
                });
              }
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ParkingSessionEdit;
