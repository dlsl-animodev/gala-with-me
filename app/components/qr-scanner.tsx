"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScannerComponent({
  onScanSuccess,
  onScanError,
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return;

      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setError("No camera found");
          return;
        }

        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("QR Code detected:", result.data);
            onScanSuccess(result.data);
            stopScanning();
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment",
          }
        );

        qrScannerRef.current = qrScanner;
        setError("");
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError("Failed to initialize camera");
        onScanError?.("Failed to initialize camera");
      }
    };

    initScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [onScanSuccess, onScanError]);

  const startScanning = async () => {
    if (!qrScannerRef.current) return;

    try {
      await qrScannerRef.current.start();
      setIsScanning(true);
      setError("");
    } catch (err) {
      console.error("Start scanning error:", err);
      setError("Failed to start camera");
      onScanError?.("Failed to start camera");
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      setIsScanning(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-64 h-64 bg-red-100 border border-red-300 rounded flex items-center justify-center">
          <p className="text-red-600 text-center">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-64 h-64 border rounded object-cover"
          autoPlay
          playsInline
          muted
        />
        {!isScanning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
            <p className="text-white text-center">
              Click Start Scanning to begin
            </p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Stop Scanning
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 text-center">
        Point your camera at a QR code to scan
      </p>
    </div>
  );
}
