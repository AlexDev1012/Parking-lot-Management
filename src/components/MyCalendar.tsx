/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import RangeSelector from "./RangeSelector";
import axios from "axios";

export default function MyCalendar({ lotId }: { lotId: string }) {
  const [ranges, setRanges] = useState<
    {
      start: Date;
      end: Date;
    }[]
  >([]);
  const ref_save = useRef(false);
  const fetchDates = async () => {
    const {
      data: { dates },
    } = await axios.get(`/unenforcable-dates/${lotId}`);
    if (!dates) return;
    setRanges(
      dates.map((d: any) => ({
        start: new Date(d.start),
        end: new Date(d.end),
      }))
    );
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const doSave = () => {
    axios.post("/unenforcable-dates", {
      lotId,
      dates: ranges,
    });
    ref_save.current = false;
  };

  useEffect(() => {
    if (ref_save.current) doSave();
  }, [ranges]);

  const ref_zoomTo = useRef<(date: Date) => void>();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="pi pi-calendar text-xl text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Unenforceable Dates
              </h1>
            </div>
            <p className="text-gray-600">
              Manage and schedule unenforceable dates for parking lots
            </p>
          </div>
        </div>
      </div>

      {/* Range Selector Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="pi pi-clock text-blue-600" />
            Time Range Selection
          </h2>
          <RangeSelector
            ranges={ranges}
            setRanges={setRanges}
            ref_zoomTo={ref_zoomTo}
            ref_save={ref_save}
          />
        </div>
      </div>

      {/* Calendar Grid Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="pi pi-calendar text-blue-600" />
            Annual Calendar View
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((month, i) => (
              <div key={i} className="flex justify-center">
                <Calendar
                  inline
                  viewDate={new Date(2024, month, 1)}
                  onSelect={(e) => {
                    if (ref_zoomTo.current)
                      ref_zoomTo.current(new Date(e.value?.toString() || ""));
                  }}
                  pt={{
                    root: {
                      className: "border border-gray-200 rounded-xl shadow-sm",
                    },
                    header: {
                      className: "bg-gray-50 border-b border-gray-200",
                    },
                    previousIcon: {
                      className: "text-gray-600 hover:text-blue-600",
                    },
                    nextIcon: {
                      className: "text-gray-600 hover:text-blue-600",
                    },
                    table: { className: "p-2" },
                    weekHeader: { className: "text-gray-500" },
                    weekNumber: { className: "text-gray-400" },
                    day: { className: "hover:bg-blue-50 transition-colors" },
                  }}
                  dateTemplate={(date) => {
                    const this_date = new Date(date.year, date.month, date.day);
                    let total = 0;
                    ranges.forEach((r) => {
                      const st = Math.max(
                        r.start.getTime(),
                        this_date.getTime()
                      );
                      const en = Math.min(
                        r.end.getTime(),
                        this_date.getTime() + 24 * 60 * 60 * 1000
                      );
                      if (en > st) total += en - st;
                    });
                    if (total > 0) {
                      return (
                        <div
                          className="pie animate relative flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                          style={
                            {
                              "--p": total / (24 * 60 * 60 * 10),
                              "--c": "rgb(59, 130, 246)",
                              "--b": "2px",
                              "--w": "32px",
                            } as any
                          }
                        >
                          <span className="relative z-10 text-sm font-medium text-gray-700">
                            {date.day}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <span className="text-sm text-gray-600">{date.day}</span>
                    );
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
