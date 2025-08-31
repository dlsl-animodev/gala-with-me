"use client";

import { Dayjs } from "dayjs";
import { User } from "../live/lib/supabase";
import QRCodeDisplay from "./qr-code-display";
import QRScannerComponent from "./qr-scanner";

interface QRActionsProps {
  user: User | null;
  selectedTime: Dayjs | null;
  mode: "show-qr" | "scan-qr";
  onScanSuccess: (qrData: string) => void;
  onBack: () => void;
}

export default function QRActions({
  user,
  selectedTime,
  mode,
  onScanSuccess,
  onBack,
}: QRActionsProps) {
  const getQRCodeData = () => {
    if (!user || selectedTime === null) return "";

    const hour = selectedTime.hour();
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return JSON.stringify({
      userId: user.id,
      time: hour12,
      name: user.name,
    });
  };

  if (mode === "show-qr") {
    return (
      <div className="flex flex-col items-center space-y-12">
        <h2 className="text-2xl font-bold text-center mt-5">Your QR Code</h2>
        <p className="text-center text-gray-600">
          Share this QR code with someone you want to match with who selected the same time
        </p>

        <QRCodeDisplay value={getQRCodeData()} />

        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Clock
        </button>
      </div>
    );
  }

  if (mode === "scan-qr") {
    return (
      <div className="flex flex-col items-center space-y-9">
        <h2 className="text-2xl font-bold text-center mt-5">Scan QR Code</h2>
        <p className="text-center text-gray-600">
          Scan someone&apos;s QR code to see if you have matching times
        </p>

        <QRScannerComponent
          onScanSuccess={onScanSuccess}
          onScanError={(error) => console.error("QR scan error:", error)}
        />

        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Clock
        </button>
      </div>
    );
  }

  return null;
}
