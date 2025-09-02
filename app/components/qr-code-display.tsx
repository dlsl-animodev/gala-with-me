"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({
  value,
  size = 220,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setError("");
      } catch (err) {
        console.error("QR Code generation error:", err);
        setError("Failed to generate QR code");
      }
    };

    generateQR();
  }, [value, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-64 h-64 bg-red-100 border border-red-300 rounded">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="max-w-[220px] max-h-[220px] sm:max-w-[240px] sm:max-h-[240px]">
        <canvas ref={canvasRef} className="border rounded w-full h-auto" />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 text-center px-2">
        Show this QR code to match
      </p>
    </div>
  );
}
