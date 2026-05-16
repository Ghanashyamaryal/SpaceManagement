import { Button } from "@/components/ui/Button";
import { useFieldArray } from "react-hook-form";
import { useEffect, useState, useRef, useCallback } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Slider } from "@/components/ui/Slider";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/Cropper";
import { API_URL } from "@/constant/constant";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { closestCenter, DndContext } from "@dnd-kit/core";
import SortableImageItem from "@/components/common/DragAndDrop/SortableImageItem";

type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height,
  outputFormat?: string
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const detectedFormat =
      outputFormat ||
      (imageSrc.includes("data:image/png")
        ? "image/png"
        : imageSrc.includes("data:image/webp")
        ? "image/webp"
        : imageSrc.includes("data:image/gif")
        ? "image/png"
        : "image/jpeg");

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, detectedFormat);
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}


const ListImageField = ({ form, name }: { form: any; name: string }) => {
  const { control, setValue, getValues, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>(
    {}
  );
  const [croppedImages, setCroppedImages] = useState<{ [key: string]: File }>(
    {}
  );

  // Cropping state
  const [cropperDialogOpen, setCropperDialogOpen] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(-1);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);

  const watchedValues = watch(name);

  // Initialize fields with existing data or ensure at least one empty input
  useEffect(() => {
    const currentValues = getValues(name) || [];

    if (fields.length === 0) {
      if (currentValues.length > 0) {
        currentValues.forEach((val: any) => append(val || null));
      } else {
        // Always ensure at least one empty input is active by default
        append(null);
      }
    }
  }, [fields, append, getValues, name]);

  // Cropping callback functions
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const openCropper = (index: number, imageUrl: string) => {
    setCurrentCropIndex(index);
    setCurrentImageUrl(imageUrl);
    setCropperDialogOpen(true);
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const closeCropper = () => {
    if (
      currentCropIndex >= 0 &&
      fileInputRefs.current[`${name}.${currentCropIndex}`]
    ) {
      fileInputRefs.current[`${name}.${currentCropIndex}`]!.value = "";
    }

    if (
      currentCropIndex >= 0 &&
      !croppedImages[`${name}.${currentCropIndex}`]
    ) {
      setFilePreviews((prev) => ({
        ...prev,
        [`${name}.${currentCropIndex}`]: "",
      }));
      setValue(`${name}.${currentCropIndex}`, null, { shouldValidate: true });
    }

    setCropperDialogOpen(false);
    setCurrentCropIndex(-1);
    setCurrentImageUrl("");
    setCroppedAreaPixels(null);
    setZoom(1);
  };

  const applyCrop = async () => {
    if (!currentImageUrl || !croppedAreaPixels || currentCropIndex < 0) {
      return;
    }

    try {
      const detectedFormat = currentImageUrl.includes("data:image/png")
        ? "image/png"
        : currentImageUrl.includes("data:image/webp")
        ? "image/webp"
        : currentImageUrl.includes("data:image/gif")
        ? "image/png"
        : "image/jpeg";

      const extension =
        detectedFormat === "image/png"
          ? "png"
          : detectedFormat === "image/webp"
          ? "webp"
          : "jpg";

      const outputWidth = Math.min(800, croppedAreaPixels.width);
      const cropAspectRatio =
        croppedAreaPixels.width / croppedAreaPixels.height;
      let outputHeight = Math.round(outputWidth / cropAspectRatio);

      if (outputHeight > 800) {
        outputHeight = 800;
      }

      const croppedBlob = await getCroppedImg(
        currentImageUrl,
        croppedAreaPixels,
        outputWidth,
        outputHeight,
        detectedFormat
      );

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image");
      }

      const croppedFile = new File(
        [croppedBlob],
        `cropped_${Date.now()}.${extension}`,
        { type: detectedFormat }
      );

      setValue(`${name}.${currentCropIndex}`, croppedFile, {
        shouldValidate: true,
      });
      setCroppedImages((prev) => ({
        ...prev,
        [`${name}.${currentCropIndex}`]: croppedFile,
      }));

      setCropperDialogOpen(false);
      setCurrentCropIndex(-1);
      setCurrentImageUrl("");
      setCroppedAreaPixels(null);
      setZoom(1);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files && e.target.files[0];

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFilePreviews((prev) => ({
          ...prev,
          [`${name}.${index}`]: imageUrl,
        }));
        openCropper(index, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = (index: number) => {
    setValue(`${name}.${index}`, null, { shouldValidate: true });
    if (fileInputRefs.current[`${name}.${index}`]) {
      fileInputRefs.current[`${name}.${index}`]!.value = "";
    }
    setFilePreviews((prev) => ({ ...prev, [`${name}.${index}`]: "" }));
    setCroppedImages((prev) => ({
      ...prev,
      [`${name}.${index}`]: undefined as any,
    }));
  };

  const getImageSrc = (value: any, index: number) => {
    if (!value) return null;

    if (value instanceof File) {
      return croppedImages[`${name}.${index}`]
        ? URL.createObjectURL(croppedImages[`${name}.${index}`])
        : filePreviews[`${name}.${index}`] || null;
    }

    if (typeof value === "string") {
      return value.startsWith("http") ? value : `${API_URL}/public/${value}`;
    }

    return null;
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field: any) => field.id === active.id);
    const newIndex = fields.findIndex((field: any) => field.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const currentValues = getValues(name);
    const reorderedValues = arrayMove(currentValues, oldIndex, newIndex);
    setValue(name, reorderedValues, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-3">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((field: any) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field, index) => {
              const currentValue = watchedValues?.[index];
              const imageSrc = getImageSrc(currentValue, index);

              return (
                <SortableImageItem
                  key={field.id}
                  field={field}
                  index={index}
                  imageSrc={imageSrc}
                  name={name}
                  fileInputRefs={fileInputRefs}
                  handleFileChange={handleFileChange}
                  handleFileDelete={handleFileDelete}
                  remove={remove}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length !== 5 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => append(null)}
          className="w-fit"
        >
          + Add Image
        </Button>
      )}

      {/* Cropper Dialog */}
      <Dialog
        open={cropperDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCropper();
          }
        }}
      >
        <DialogContent
          className="gap-0 p-0 sm:max-w-4xl"
          showCloseButton={false}
        >
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={closeCropper}
                  aria-label="Cancel"
                >
                  <X aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <Button
                className="-my-1 z-10"
                onClick={applyCrop}
                disabled={!currentImageUrl}
                autoFocus
              >
                Apply
              </Button>
            </DialogTitle>
          </DialogHeader>

          {currentImageUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={currentImageUrl}
              zoom={zoom}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}

          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOut
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
              />
              <ZoomIn
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListImageField;