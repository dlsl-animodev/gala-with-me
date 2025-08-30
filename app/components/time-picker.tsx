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
        .from('users')
        .update({ preferred_time: time })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preferred time:', error);
      } else {
        console.log('Preferred time updated successfully:', time);
      }
    } catch (err) {
      console.error('Error updating preferred time:', err);
    }
  };

  const handleTimeSelect = (time: Dayjs | null) => {
    if (time) {
      onTimeSelect(time);
      const hour = time.hour();
      // Convert 24-hour to 12-hour format for storage
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
      <div className="flex flex-col items-center space-y-6">
        <h2 className="text-2xl font-bold text-center text-black">
          Choose your preferred time
        </h2>
        
        <div className="w-full max-w-sm">
          <StaticTimePicker
            value={selectedTime}
            onChange={handleTimeSelect}
            views={['hours']}
            slotProps={{
              actionBar: {
                actions: [],
              },
            }}
          />
        </div>

        {selectedTime && (
          <div className="text-center space-y-4">
            <p className="text-lg">
              You selected: <span className="font-bold">{getDisplayTime()}</span>
            </p>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
