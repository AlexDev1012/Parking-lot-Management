/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import MyCalendar from "../components/MyCalendar";
import { Dropdown } from "primereact/dropdown";
import { LotType } from "../types";
import { defaultAllLot } from "../config";
import { useAppSelector } from "../redux/store";

const UnenforcableDates = () => {
  const { lots } = useAppSelector((state) => state.app);
  const [selectedLot, setSelectedLot] = useState<LotType>(defaultAllLot);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Dropdown
        pt={{ root: { className: "border border-black" } }}
        value={selectedLot}
        onChange={(e) => setSelectedLot(e.value)}
        options={[defaultAllLot, ...lots]}
        optionLabel="siteCode"
        placeholder="Select a lot"
        className="w-full md:w-14rem"
      />
      {selectedLot && (
        <MyCalendar key={selectedLot.siteCode} lotId={selectedLot._id} />
      )}
    </div>
  );
};
export default UnenforcableDates;
