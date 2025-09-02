"use client";

import { Dayjs } from "dayjs";
import { useRef, useEffect } from "react";
import { User } from "../live/lib/supabase";
import QRCodeDisplay from "./qr-code-display";
import QRScannerComponent, { QRScannerRef } from "./qr-scanner";

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
  const qrScannerRef = useRef<QRScannerRef>(null);

  const handleBack = () => {
    // Stop camera before going back
    if (qrScannerRef.current) {
      qrScannerRef.current.stopCamera();
    }
    onBack();
  };

  // camera will be stopped when user leaves scan qr page
  useEffect(() => {
    const currentRef = qrScannerRef.current;
    
    // cleanup when user exits scan qr page
    if (mode !== "scan-qr" && currentRef) {
      currentRef.stopCamera();
    }
    
    return () => {
      // cleanup on unmount
      if (currentRef) {
        currentRef.stopCamera();
      }
    };
  }, [mode]);

  // Additional cleanup on unmount
  useEffect(() => {
    const currentRef = qrScannerRef.current;
    return () => {
      console.log("QRActions final cleanup");
      if (currentRef) {
        currentRef.stopCamera();
      }
    };
  }, []);
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
      <div className="flex flex-col items-center space-y-4 sm:space-y-8 h-full justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mt-2 sm:mt-5 mb-2">
            Your QR Code
          </h2>
          <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs sm:text-sm font-semibold">
            You selected: {selectedTime?.hour()} o&apos;clock
          </code>
        </div>
        <p className="text-center text-gray-600 text-xs sm:text-sm px-2">
          Share this QR code with someone you want to match with who selected
          the same time
        </p>

        <QRCodeDisplay value={getQRCodeData()} />

        <button
          onClick={handleBack}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-sm sm:text-base font-medium mb-2"
        >
          Back to Clock
        </button>
      </div>
    );
  }

  if (mode === "scan-qr") {
    return (
      <div className="flex flex-col items-center space-y-2 sm:space-y-4 h-full justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-center mt-2 sm:mt-4">
          Scan QR Codes
        </h2>
        <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs sm:text-sm font-semibold">
          You selected: {selectedTime?.hour()} o&apos;clock
        </code>
        <p className="text-center text-gray-600 text-xs sm:text-sm px-2">
          Scan someone&apos;s QR code to see if you have matching times
        </p>

        <div className="flex-1 w-full flex items-center justify-center max-h-[60%]">
          <QRScannerComponent
            ref={qrScannerRef}
            onScanSuccess={onScanSuccess}
            onScanError={(error) => console.error("QR scan error:", error)}
          />
        </div>

        <button
          onClick={handleBack}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-sm sm:text-base font-medium mb-2"
        >
          Back to Clock
        </button>
      </div>
    );
  }

  return null;
}
