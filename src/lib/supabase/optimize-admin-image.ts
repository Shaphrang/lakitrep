const ONE_KB = 1024;

const DEFAULT_TARGET_SIZE_BYTES = 450 * ONE_KB;
const DEFAULT_MAX_SIZE_BYTES = 500 * ONE_KB;
const DEFAULT_OUTPUT_MIME_TYPE = "image/webp";

const QUALITY_STEPS = [0.86, 0.8, 0.74, 0.68] as const;

type ImageOptimizationPreset = {
  maxWidth: number;
  targetSizeBytes: number;
  maxSizeBytes: number;
  outputMimeType: "image/webp";
};

type OptimizationResult =
  | {
      success: true;
      file: File;
      originalSizeBytes: number;
      optimizedSizeBytes: number;
      originalWidth: number;
      originalHeight: number;
      outputWidth: number;
      outputHeight: number;
    }
  | {
      success: false;
      error: string;
    };

function buildOutputFileName(fileName: string, mimeType: string) {
  const outputExt = mimeType === "image/webp" ? "webp" : fileName.split(".").pop() ?? "jpg";
  const fileNameWithoutExtension = fileName.replace(/\.[^.]+$/, "");
  return `${fileNameWithoutExtension}.${outputExt}`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read selected image."));
    };

    image.src = objectUrl;
  });
}

async function encodeCanvas(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, quality));

  if (!blob) {
    throw new Error("Your browser could not encode this image format.");
  }

  return blob;
}

export function getImageOptimizationPreset(folder: string): ImageOptimizationPreset {
  const normalizedFolder = folder.toLowerCase().trim();
  const isGallery = normalizedFolder.includes("/gallery");

  return {
    maxWidth: isGallery ? 1400 : 1600,
    targetSizeBytes: DEFAULT_TARGET_SIZE_BYTES,
    maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
    outputMimeType: DEFAULT_OUTPUT_MIME_TYPE,
  };
}

export async function optimizeAdminImage(file: File, folder: string): Promise<OptimizationResult> {
  if (!file || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files can be uploaded." };
  }

  const preset = getImageOptimizationPreset(folder);

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, preset.maxWidth / image.naturalWidth);
    const outputWidth = Math.max(1, Math.round(image.naturalWidth * scale));
    const outputHeight = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return { success: false, error: "Could not initialize browser image processing." };
    }

    context.drawImage(image, 0, 0, outputWidth, outputHeight);

    let chosenBlob: Blob | null = null;
    let bestBlob: Blob | null = null;

    for (const quality of QUALITY_STEPS) {
      const blob = await encodeCanvas(canvas, preset.outputMimeType, quality);
      bestBlob = blob;

      if (blob.size <= preset.maxSizeBytes) {
        chosenBlob = blob;
        break;
      }

      const isNearTarget = Math.abs(blob.size - preset.targetSizeBytes) <= 60 * ONE_KB;
      if (isNearTarget) {
        chosenBlob = blob;
        break;
      }
    }

    const finalBlob = chosenBlob ?? bestBlob;

    if (!finalBlob) {
      return { success: false, error: "Could not optimize selected image." };
    }

    const optimizedFile = new File([finalBlob], buildOutputFileName(file.name, preset.outputMimeType), {
      type: preset.outputMimeType,
      lastModified: Date.now(),
    });

    return {
      success: true,
      file: optimizedFile,
      originalSizeBytes: file.size,
      optimizedSizeBytes: optimizedFile.size,
      originalWidth: image.naturalWidth,
      originalHeight: image.naturalHeight,
      outputWidth,
      outputHeight,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not process selected image.",
    };
  }
}
