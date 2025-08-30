"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticTimePicker } from "@mui/x-date-pickers/StaticTimePicker";
import { Dayjs } from "dayjs";
import { supabase, User } from "../lib/supabase";

interface TimePickerProps {
  user: User | null;
  selectedTime: Dayjs | null;
  onTimeSelect: (time: Dayjs | null) => void;
}

export default function TimePicker({ user, selectedTime, onTimeSelect }: TimePickerProps) {
  const updatePreferredTime = async (time: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ preferred_time: time })
        .eq("id", user.id);

      if (error) console.error("Error updating preferred time:", error);
      else console.log("Preferred time updated successfully:", time);
    } catch (err) {
      console.error("Error updating preferred time:", err);
    }
  };

  const handleTimeSelect = (time: Dayjs | null) => {
    if (time) {
      onTimeSelect(time);
      const hour = time.hour();
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      updatePreferredTime(hour12);
    }
  };

  const getDisplayTime = () => {
    if (!selectedTime) return "";
    const hour = selectedTime.hour();
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:00`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col items-center space-y-6 min-h-screen justify-center bg-[#f5f5f5] p-4">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-[#ff6b00] 
                       [text-shadow:0_0_5px_#ff6b00,0_0_10px_#ffaa55] animate-pulse">
          ⏰ Choose your preferred time
        </h2>

        {/* Time Picker Container */}
        <div className="w-full max-w-sm bg-white rounded-2xl border-4 border-[#ff6b00] 
                        shadow-[0_0_15px_rgba(255,107,0,0.4)] p-6">
          <StaticTimePicker
            value={selectedTime}
            onChange={handleTimeSelect}
            views={["hours"]}
            slotProps={{
              actionBar: { actions: [] },
            }}
            sx={{
              "& .MuiClockPicker-root": {
                backgroundColor: "#fff7f0",
                borderRadius: "1rem",
                boxShadow: "0 0 15px rgba(255,107,0,0.3)",
              },
              "& .Mui-selected": {
                backgroundColor: "#ff6b00 !important",
                color: "#fff !important",
              },
              "& .MuiClockPicker-clock": {
                color: "#ff6b00",
              },
            }}
          />
        </div>

        {/* Display Selected Time */}
        {selectedTime && (
          <div className="text-center space-y-2 bg-[#fff7f0] px-6 py-4 rounded-xl 
                          border-2 border-[#ff6b00] shadow-[0_0_10px_#ff6b00]">
            <p className="text-lg text-black font-[var(--font-retro)]">
              You selected:{" "}
              <span className="font-bold text-[#ff6b00]">{getDisplayTime()}</span>
            </p>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
