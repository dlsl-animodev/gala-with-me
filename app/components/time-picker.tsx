"use client";

import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { supabase, User } from "../lib/supabase";

interface TimePickerProps {
  user: User | null;
  selectedTime: Dayjs | null;
  onTimeSelect: (time: Dayjs | null) => void;
  isHourMatched?: (hour: number) => boolean;
}

export default function TimePicker({ user, selectedTime, onTimeSelect, isHourMatched }: TimePickerProps) {
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

  const handleHourSelect = (hour: number) => {
    // Create a dayjs object with the selected hour (using today's date)
    const time = dayjs().hour(hour).minute(0).second(0);
    onTimeSelect(time);
    
    // Store as 1-12 format directly (much simpler!)
    updatePreferredTime(hour);
  };

  const getSelectedHour = () => {
    if (!selectedTime) return null;
    const hour = selectedTime.hour();
    // Convert 24-hour to 12-hour format for display
    return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const selectedHour = getSelectedHour();

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-2xl font-bold text-center text-black">
        Choose your preferred time
      </h2>
      
      <div className="relative w-80 h-80">
        {/* Clock face background */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-300 bg-white shadow-lg"></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
        
        {/* Hour numbers */}
        {hours.map((hour, index) => {
          const angle = (index * 30) - 90; // 30 degrees per hour, starting from 12 o'clock
          const radian = (angle * Math.PI) / 180;
          const radius = 120; // Distance from center
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;
          
          const isSelected = selectedHour === hour;
          const isMatched = isHourMatched ? isHourMatched(hour) : false;
          
          return (
            <button
              key={hour}
              onClick={() => !isMatched && handleHourSelect(hour)}
              disabled={isMatched}
              className={`
                absolute w-12 h-12 rounded-full font-bold text-lg transition-all transform -translate-x-1/2 -translate-y-1/2
                ${isMatched
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  : isSelected
                    ? 'bg-blue-500 text-white shadow-lg scale-110'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:scale-105'
                }
              `}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              title={isMatched ? `${hour}:00 - Already matched` : `Select ${hour}:00`}
            >
              {hour}
              {isMatched && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>}
            </button>
          );
        })}
        
        {/* Hour hand pointing to selected hour */}
        {selectedHour && (
          <div
            className="absolute top-1/2 left-1/2 w-1 bg-blue-500 rounded transform-gpu origin-bottom z-5"
            style={{
              height: '80px',
              transform: `translate(-50%, -100%) rotate(${(selectedHour === 12 ? 0 : selectedHour) * 30}deg)`,
            }}
          />
        )}
      </div>

      {selectedTime && (
        <div className="text-center space-y-4">
          <p className="text-lg">
            You selected: <span className="font-bold text-blue-600">{selectedHour}:00</span>
          </p>
        </div>
      )}
    </div>
  );
}
