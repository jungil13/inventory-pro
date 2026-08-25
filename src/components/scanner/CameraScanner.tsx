"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw, Zap, ZapOff, AlertCircle } from "lucide-react";
import { soundFx } from "@/lib/audio/sound-fx";

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  active?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, active = true }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check and start stream
  useEffect(() => {
    if (!active) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [active, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        setErrorMessage("Camera access is not supported in this browser or environment.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);

      // Check torch
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as Record<string, unknown>) : null;
      if (capabilities && "torch" in capabilities) {
        setHasTorch(true);
      }

      // Start frame scanner loop
      startScanningLoop();
    } catch (err: unknown) {
      setHasPermission(false);
      const errObj = err as Error;
      if (errObj.name === "NotAllowedError" || errObj.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission was denied. Please allow camera permissions to scan barcodes.");
      } else {
        setErrorMessage(`Unable to access camera: ${errObj.message || "Unknown error"}`);
      }
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const next = !torchOn;
        await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: next }],
        });
        setTorchOn(next);
      } catch {
        // Torch toggle failed
      }
    }
  };

  const startScanningLoop = () => {
    // If native BarcodeDetector is available (supported in Chrome/Edge/Android)
    const hasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

    let detector: unknown = null;
    if (hasBarcodeDetector) {
      try {
        const BarcodeDetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => unknown }).BarcodeDetector;
        detector = new BarcodeDetectorClass({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "qr_code"],
        });
      } catch {
        detector = null;
      }
    }

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      if (detector) {
        try {
          const detectorObj = detector as { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
          const barcodes = await detectorObj.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const detected = barcodes[0].rawValue;
            if (detected) {
              onScan(detected);
            }
          }
        } catch {
          // Frame detect skip
        }
      } else if (canvasRef.current) {
        // Simple fallback canvas frame capture
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
    }, 200);
  };

  return (
    <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
      {/* Video element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Targeting reticle overlay */}
      {hasPermission && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          <div className="relative w-64 sm:w-80 h-36 sm:h-44 border-2 border-blue-500/60 rounded-2xl overflow-hidden shadow-2xl backdrop-brightness-110">
            {/* Animated sweeping laser line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-laser" />

            {/* Corner guides */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br-sm" />
          </div>

          <p className="mt-3 px-3 py-1 bg-slate-950/75 backdrop-blur-md rounded-full text-xs font-semibold text-slate-200 tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Align barcode within frame
          </p>
        </div>
      )}

      {/* Control buttons */}
      {hasPermission && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2.5 rounded-full backdrop-blur-md text-white border transition-colors ${
                torchOn
                  ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/30"
                  : "bg-slate-900/80 border-slate-700 hover:bg-slate-800"
              }`}
            >
              {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFacingMode}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white rounded-full backdrop-blur-md transition-colors"
            title="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error or Denied State */}
      {hasPermission === false && (
        <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-200 mb-1 text-base">Camera Unavailable</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {errorMessage || "Please check camera permissions in your browser or connect a webcam."}
          </p>
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Retry Camera Access
          </button>
        </div>
      )}
    </div>
  );
};
