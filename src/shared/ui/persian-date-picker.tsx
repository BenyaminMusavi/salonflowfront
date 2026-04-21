"use client";

import { useMemo, useState } from "react";
import { toJalaali, toGregorian } from "jalaali-js";

const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const months = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند",
];

function getMonthLength(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return ((jy + 38) * 31) % 128 < 31 ? 30 : 29;
}

export default function PersianDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const today = toJalaali(new Date());
  const [year] = useState(today.jy);
  const [month] = useState(today.jm);

  const todayDay = today.jd;

  const days = useMemo(() => {
    return Array.from(
      { length: getMonthLength(year, month) },
      (_, i) => i + 1
    );
  }, [year, month]);

  const getWeekDay = (day: number) => {
    const { gy, gm, gd } = toGregorian(year, month, day);
    const date = new Date(gy, gm - 1, gd);
    return weekDays[(date.getDay() + 1) % 7];
  };

  const selectDay = (day: number) => {
    const formatted = `${getWeekDay(day)} ${day} ${months[month - 1]} ${year}`;
    onChange(formatted);
    setOpen(false);
  };

  return (
    <div className="relative w-full">

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full p-3 rounded-xl
          bg-white text-right
          border border-gray-200
          text-gray-800
          hover:border-blue-500
          transition
          shadow-sm
        "
      >
        {value || "انتخاب تاریخ"}
      </button>

      {/* Calendar */}
      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full
            rounded-2xl shadow-2xl
            border border-gray-200
            bg-white
            overflow-hidden
          "
        >

          {/* Header */}
          <div
            className="
              flex justify-between items-center
              px-4 py-3
              bg-gradient-to-r from-blue-600 to-blue-500
              text-white
            "
          >
            <span className="font-semibold">
              {months[month - 1]}
            </span>
            <span className="text-sm opacity-80">{year}</span>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 text-center text-xs bg-gray-50 text-gray-500 py-2">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 p-2 bg-white">

            {days.map((d) => {
              const isToday = d === todayDay;

              return (
                <button
                  key={d}
                  onClick={() => selectDay(d)}
                  className={`
                    p-2 rounded-lg text-sm transition
                    hover:bg-blue-100
                    ${isToday
                      ? "bg-blue-600 text-white font-bold shadow"
                      : "text-gray-800"
                    }
                  `}
                >
                  {d}
                </button>
              );
            })}

          </div>

        </div>
      )}
    </div>
  );
}