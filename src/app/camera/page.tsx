"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import { LuCamera, LuX } from "react-icons/lu";
import { usePhotos } from "../../contexts/PhotoContext";
import {
  detectFaceAndCrop,
  initializeFaceDetection,
} from "../../utils/faceDetection";

export default function CameraPage() {
  const router = useRouter();
  const { addPhoto } = usePhotos();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      let errorMessage =
        "لا يمكن الوصول للكاميرا. يرجى السماح بالوصول للكاميرا.";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage =
            "تم رفض الوصول للكاميرا. يرجى السماح بالوصول من إعدادات المتصفح.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "لم يتم العثور على كاميرا. تأكد من وجود كاميرا متصلة.";
        } else if (err.name === "NotReadableError") {
          errorMessage = "الكاميرا قيد الاستخدام من تطبيق آخر.";
        }
      }

      setError(errorMessage);
    }
  };

  const startCountdown = () => {
    setIsCapturing(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    setIsProcessing(true);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply mirroring transform to match video preview
    context.scale(-1, 1);
    context.drawImage(video, -video.videoWidth, 0);
    context.scale(-1, 1); // Reset transform

    const originalPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    try {
      // Initialize face detection if needed
      await initializeFaceDetection();

      // Perform face detection and cropping
      const faceDetectionResult = await detectFaceAndCrop(originalPhotoDataUrl);

      let finalPhoto;

      if (faceDetectionResult.success && faceDetectionResult.croppedDataUrl) {
        // Use cropped image as main photo if face detection succeeded
        finalPhoto = {
          id: Date.now().toString(),
          dataUrl: faceDetectionResult.croppedDataUrl,
          originalDataUrl: originalPhotoDataUrl,
          cropData: faceDetectionResult.cropData,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Fallback to original image if face detection failed
        console.log("Face detection failed:", faceDetectionResult.error);
        finalPhoto = {
          id: Date.now().toString(),
          dataUrl: originalPhotoDataUrl,
          timestamp: new Date().toISOString(),
        };
      }

      // Save photo using PhotoContext (defer to avoid render cycle conflict)
      setTimeout(() => addPhoto(finalPhoto), 0);
    } catch (error) {
      console.error("Error processing photo:", error);
      // Fallback to original image on any error
      const fallbackPhoto = {
        id: Date.now().toString(),
        dataUrl: originalPhotoDataUrl,
        timestamp: new Date().toISOString(),
      };
      setTimeout(() => addPhoto(fallbackPhoto), 0);
    } finally {
      setIsProcessing(false);

      // Stop camera stream and reset states
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setIsCapturing(false);
      setCountdown(null);

      // Navigate back to home (defer to avoid render cycle conflict)
      setTimeout(() => router.push("/"), 0);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="h-dvh bg-primary-300 p-8 flex flex-col">
      <div
        className="w-full h-full py-6 rounded-2xl flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: `url('/pattern_2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 z-10">
          <LuX
            size={44}
            onClick={handleBack}
            color="#6f00ff"
            className="cursor-pointer m-3"
          />
          <h1 className="text-6xl text-primary-300">التقط صورتك</h1>
          <div className="w-18"></div>
        </div>

        {/* Camera View */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative h-full">
          {error ? (
            <div className="text-center">
              <p className="text-2xl text-red-500 mb-4">{error}</p>
              <Button onClick={startCamera} variant="primary">
                حاول مرة أخرى
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 relative w-full aspect-square rounded-3xl overflow-hidden bg-black mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* Countdown Overlay */}
                {countdown && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-8xl font-bold text-white animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-2xl font-bold mb-2">
                        معالجة الصورة...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <Button
                onClick={startCountdown}
                disabled={isCapturing || isProcessing || !stream}
                variant="primary"
                size="large"
                className="flex items-center gap-3 !py-8 !px-12"
              >
                <LuCamera size={32} />
                {isProcessing
                  ? "معالجة..."
                  : isCapturing
                  ? "جاري التصوير..."
                  : "التقط الصورة"}
              </Button>
            </>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
