import {
  FaceDetector,
  FilesetResolver,
  Detection,
} from "@mediapipe/tasks-vision";

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  success: boolean;
  cropData?: CropData;
  croppedDataUrl?: string;
  error?: string;
}

let faceDetector: FaceDetector | null = null;
let isInitializing = false;

export const initializeFaceDetection = async (): Promise<boolean> => {
  try {
    if (faceDetector) return true;
    if (isInitializing) {
      // Wait for existing initialization to complete
      while (isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return !!faceDetector;
    }

    isInitializing = true;

    // Initialize the FilesetResolver for vision tasks
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // Create the FaceDetector
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
      minSuppressionThreshold: 0.3,
    });

    isInitializing = false;
    return true;
  } catch (error) {
    isInitializing = false;
    console.error("Failed to initialize face detection:", error);
    return false;
  }
};

const createCanvasFromImage = (
  imageDataUrl: string
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
};

const createImageFromCanvas = (
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to create image from canvas"));
    img.src = canvas.toDataURL();
  });
};

const cropImageCanvas = (
  sourceCanvas: HTMLCanvasElement,
  cropData: CropData,
  quality: number = 0.8
): string => {
  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d");

  if (!cropCtx) {
    throw new Error("Failed to get crop canvas context");
  }

  cropCanvas.width = cropData.width;
  cropCanvas.height = cropData.height;

  cropCtx.drawImage(
    sourceCanvas,
    cropData.x,
    cropData.y,
    cropData.width,
    cropData.height,
    0,
    0,
    cropData.width,
    cropData.height
  );

  return cropCanvas.toDataURL("image/jpeg", quality);
};

const calculateCropArea = (
  detection: Detection,
  imageWidth: number,
  imageHeight: number
): CropData => {
  const bbox = detection.boundingBox;

  if (!bbox) {
    throw new Error("No bounding box found in detection");
  }

  // Convert normalized coordinates to pixel coordinates
  const faceX = bbox.originX;
  const faceY = bbox.originY;
  const faceWidth = bbox.width;
  const faceHeight = bbox.height;

  // Add padding for shoulders (extend down by 50% of face height)
  const shoulderPadding = faceHeight * 0.5;
  // Add side padding (extend sides by 35% of face width)
  const sidePadding = faceWidth * 0.35;

  // Calculate crop area with padding
  let cropX = Math.max(0, faceX - sidePadding);
  let cropY = Math.max(0, faceY);
  let cropWidth = Math.min(imageWidth - cropX, faceWidth + 2 * sidePadding);
  let cropHeight = Math.min(imageHeight - cropY, faceHeight + shoulderPadding);

  // Ensure crop area is within image bounds
  cropX = Math.round(cropX);
  cropY = Math.round(cropY);
  cropWidth = Math.round(cropWidth);
  cropHeight = Math.round(cropHeight);

  return {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  };
};

export const detectFaceAndCrop = async (
  imageDataUrl: string
): Promise<FaceDetectionResult> => {
  try {
    if (!faceDetector) {
      const initialized = await initializeFaceDetection();
      if (!initialized) {
        return {
          success: false,
          error: "Failed to initialize face detection",
        };
      }
    }

    if (!faceDetector) {
      return {
        success: false,
        error: "Face detector not available",
      };
    }

    const canvas = await createCanvasFromImage(imageDataUrl);
    const image = await createImageFromCanvas(canvas);

    // Perform face detection
    const detectionResult = faceDetector.detect(image);

    if (
      !detectionResult.detections ||
      detectionResult.detections.length === 0
    ) {
      return {
        success: false,
        error: "No face detected",
      };
    }

    // Use the first (most confident) detection
    const detection = detectionResult.detections[0];

    if (!detection.boundingBox) {
      return {
        success: false,
        error: "No bounding box found",
      };
    }

    const imageWidth = canvas.width;
    const imageHeight = canvas.height;

    const cropData = calculateCropArea(detection, imageWidth, imageHeight);
    const croppedDataUrl = cropImageCanvas(canvas, cropData);

    return {
      success: true,
      cropData,
      croppedDataUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: `Detection error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const cleanup = () => {
  if (faceDetector) {
    faceDetector.close();
    faceDetector = null;
  }
};
