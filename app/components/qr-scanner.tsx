"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import QrScanner from "qr-scanner";
QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: string) => void;
}

export interface QRScannerRef {
  stopCamera: () => void;
}

const QRScannerComponent = forwardRef<QRScannerRef, QRScannerProps>(({
  onScanSuccess,
  onScanError,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;
  const onScanErrorRef = useRef(onScanError);
  onScanErrorRef.current = onScanError;
  const initializedRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    
    if (initializedRef.current) {
      console.log("QRScanner already initialized (StrictMode guard)");
      return;
    }

    initializedRef.current = true;

    let scanner: QrScanner | null = null;

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
            // Ignore further detections while processing
            if (processingRef.current) {
              return;
            }
            processingRef.current = true;
            setIsProcessing(true);
            
            // small delay to show the loading state, then process
            setTimeout(() => {
              onScanSuccessRef.current(result.data);
              setIsProcessing(false);
              processingRef.current = false;
            }, 500);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment",
          }
        );

        qrScannerRef.current = qrScanner;
        scanner = qrScanner;
        setError("");
        
        // start camera immediately
        try {
          setIsStarting(true);
          await qrScanner.start();

          setIsScanning(true);
          setNeedsPermission(false);
          setIsStarting(false);

        } catch (startError) {
          console.error("Auto-start error:", startError);
          setIsStarting(false);
          const errorMessage = startError instanceof Error ? startError.message : "Auto-start failed";
          
          if (errorMessage.includes("Permission") || errorMessage.includes("NotAllowed") || errorMessage.includes("NotReadableError") || errorMessage.includes("aborted")) {
            console.log("Permission required");
            setNeedsPermission(true);
          } else {
            console.log("Setting permission required as fallback");
            setNeedsPermission(true);
          }
        }
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError("Failed to initialize camera");
        onScanErrorRef.current?.("Failed to initialize camera");
      }
    };

    initScanner();

    const videoEl = videoRef.current;

    return () => {
      // here we stop/destroy qrscanner ref
      if (qrScannerRef.current) {
        try { qrScannerRef.current.stop(); } catch {}
        try { qrScannerRef.current.destroy(); } catch {}
        qrScannerRef.current = null;
      }
      // stop/destroy local scanner handle as a fallback
      if (scanner) {
        try { scanner.stop(); } catch {}
        try { scanner.destroy(); } catch {}
        scanner = null;
      }
      // here we hard-stop any leftover media tracks on the video element
      if (videoEl) {
        const stream = (videoEl.srcObject as MediaStream | null) ?? null;
        if (stream) {
          try { stream.getTracks().forEach(t => { try { t.stop(); } catch {} }); } catch {}
          try { (videoEl as HTMLVideoElement).srcObject = null; } catch {}
        }
      }
    };
  }, []);

  const startScanning = async () => {
    if (!qrScannerRef.current || isStarting) {
      console.log("Scanner not available or already starting");
      return;
    }

    try {
      setIsStarting(true);
      setNeedsPermission(false);
      setError("");
      
      try {
        // make sure na qr scanner is stopped first b4 scanning
        qrScannerRef.current.stop();
      } catch (stopError) {
        console.log("No previous instance to stop:", stopError);
      }
      
      // small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await qrScannerRef.current.start();

      setIsScanning(true);
      setIsStarting(false);

    } catch (err) {
      console.error("Start scanning error:", err);
      setIsStarting(false);
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
      
      if (errorMessage.includes("Permission") || errorMessage.includes("NotAllowed") || errorMessage.includes("NotReadableError") || errorMessage.includes("aborted")) {
        console.log("Permission still required or operation aborted");
        setNeedsPermission(true);
        setError("");
      } else {
        console.log("Other error:", errorMessage);
        setError("Failed to start camera");
        onScanErrorRef.current?.("Failed to start camera");
      }
    }
  };

  const stopCamera = () => {
    console.log("stopCamera called");

    if (qrScannerRef.current) {
      console.log("Stopping and destroying scanner");

      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;

      setIsScanning(false);
      setIsProcessing(false);
      setNeedsPermission(false);
      setIsStarting(false);
    } else {
      console.log("No scanner to stop");
    }
  };

  // Expose stopCamera to parent component
  useImperativeHandle(ref, () => ({
    stopCamera
  }));

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
    <div className="flex flex-col items-center space-y-2 w-full">
      <div className="relative w-full max-w-[230px] max-h-[230px] sm:max-w-[260px] sm:max-h-[260px]">
        <video
          ref={videoRef}
          className="w-full h-full aspect-square border rounded object-cover"
          autoPlay
          playsInline
          muted
        />
        {(!isScanning && !isProcessing && !needsPermission) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
            <p className="text-white text-center text-xs sm:text-sm">
              {isStarting ? "Starting camera..." : "Initializing camera..."}
            </p>
          </div>
        )}
        {needsPermission && !isScanning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded p-4">
            <p className="text-white text-center text-xs sm:text-sm mb-4">
              Camera permission required
            </p>
            <button
              onClick={startScanning}
              disabled={isStarting}
              className="px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {isStarting ? "Starting..." : "Allow Camera Access"}
            </button>
          </div>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <p className="text-white text-center text-xs sm:text-sm font-medium">
              Processing QR Code...
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 text-center">
        Point camera at QR code
      </p>
    </div>
  );
});

QRScannerComponent.displayName = "QRScannerComponent";

export default QRScannerComponent;
