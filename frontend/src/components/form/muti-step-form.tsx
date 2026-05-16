import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { useState, useCallback, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/TextArea";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  User,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Select2 } from "@/components/ui/Select2";

// Import existing form field components
import { API_URL } from "@/constant/constant";
import JoditEditor from "jodit-react";
import ObjectListField from "./objectlist";
import ListField from "./listfield";
import Loading from "@/components/common/Loading";

type Field = {
  name: string;
  label: string;
  type: string;
  existingFileName? : string;
  existingFilePath? : string;
  required?: boolean;
  fields?: any[];
  accept?: string;
  landscape?: boolean;
  portrait?: boolean;
  cropWidth?: number;
  cropHeight?: number;
  disableCrop?: boolean;
  emptyMessage?: string | ((formData: any) => string);
  [key: string]: any;
};

// Define type for pixel crop area
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
  outputFormat?: string,
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
      outputHeight,
    );

    // Detect format from data URL or use provided format
    const detectedFormat =
      outputFormat ||
      (imageSrc.includes("data:image/png")
        ? "image/png"
        : imageSrc.includes("data:image/webp")
          ? "image/webp"
          : imageSrc.includes("data:image/gif")
            ? "image/png" // GIF to PNG for static crop
            : "image/jpeg"); // Default fallback

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

type StepConfig = {
  title: string;
  description: string;
  fields: Field[];
};

type MultiStepFormProps = {
  steps: StepConfig[];
  defaultValue: any;
  onSubmit: (data: any) => void;
  validationSchema: any;
  title1: string;
  titleLink1: string;
  titleLink2?: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
  heading1?: string;
};

export function MultiStepFormComponent({
  steps,
  defaultValue,
  onSubmit,
  validationSchema,
  submitButtonText,
  isSubmitting,
  heading1,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(defaultValue || {});

  // File input refs and preview states
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>(
    {},
  );

  // Cropping state
  const [cropperDialogOpen, setCropperDialogOpen] = useState(false);
  const [currentCropField, setCurrentCropField] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const [croppedImages, setCroppedImages] = useState<{ [key: string]: File }>(
    {},
  );

  const form = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultValue,
  });

  // Update form data when defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setFormData(defaultValue);
      form.reset(defaultValue);
    }
  }, [defaultValue, form]);

  // Update form when formData changes (for step navigation)
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      form.reset(formData);
    }
  }, [formData, form]);

  // Cropping callback functions
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const openCropper = (fieldName: string, imageUrl: string) => {
    setCurrentCropField(fieldName);
    setCurrentImageUrl(imageUrl);
    setCropperDialogOpen(true);
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const closeCropper = () => {
    // Only clear everything if there's no existing cropped image or form value
    if (
      currentCropField &&
      !croppedImages[currentCropField] &&
      !form.getValues(currentCropField)
    ) {
      // Reset file input when dialog is closed without applying and no existing value
      if (fileInputRefs.current[currentCropField]) {
        fileInputRefs.current[currentCropField]!.value = "";
      }
      // Clear preview if no cropped image exists and no form value
      setFilePreviews((prev) => ({ ...prev, [currentCropField]: "" }));
      form.setValue(currentCropField, "", { shouldValidate: true });
    }

    setCropperDialogOpen(false);
    setCurrentCropField("");
    setCurrentImageUrl("");
    setCroppedAreaPixels(null);
    setZoom(1);
  };

  const applyCrop = async () => {
    if (!currentImageUrl || !croppedAreaPixels || !currentCropField) {
      return;
    }

    try {
      // Get current field configuration
      const currentField = steps
        .flatMap((step) => step.fields)
        .find((field) => field.name === currentCropField);

      // Detect original format from the image URL
      const detectedFormat = currentImageUrl.includes("data:image/png")
        ? "image/png"
        : currentImageUrl.includes("data:image/webp")
          ? "image/webp"
          : currentImageUrl.includes("data:image/gif")
            ? "image/png"
            : "image/jpeg";

      // Get file extension based on format
      const extension =
        detectedFormat === "image/png"
          ? "png"
          : detectedFormat === "image/webp"
            ? "webp"
            : "jpg";

      // Calculate output dimensions based on field type and custom settings
      let outputWidth: number;
      let outputHeight: number;

      if (currentField?.cropWidth && currentField?.cropHeight) {
        // Use custom dimensions if specified
        outputWidth = currentField.cropWidth;
        outputHeight = currentField.cropHeight;
      } else if (currentField?.portrait) {
        // Portrait: 3:4 aspect ratio (600x800)
        outputWidth = 600;
        outputHeight = 800;
      } else if (currentField?.landscape) {
        // Landscape: 4:3 aspect ratio (800x600)
        outputWidth = 800;
        outputHeight = 600;
      } else {
        // Default: maintain crop area aspect ratio with max 800px width
        const cropAspectRatio =
          croppedAreaPixels.width / croppedAreaPixels.height;
        outputWidth = Math.min(800, croppedAreaPixels.width);
        outputHeight = Math.round(outputWidth / cropAspectRatio);

        // Ensure height doesn't exceed 800px
        if (outputHeight > 800) {
          outputHeight = 800;
          outputWidth = Math.round(outputHeight * cropAspectRatio);
        }
      }

      const croppedBlob = await getCroppedImg(
        currentImageUrl,
        croppedAreaPixels,
        outputWidth,
        outputHeight,
        detectedFormat,
      );

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image");
      }

      // Convert blob to File with correct type and extension
      const croppedFile = new File(
        [croppedBlob],
        `cropped_${Date.now()}.${extension}`,
        {
          type: detectedFormat,
        },
      );

      // Set the cropped file to the form and state
      form.setValue(currentCropField, croppedFile, { shouldValidate: true });
      setCroppedImages((prev) => ({
        ...prev,
        [currentCropField]: croppedFile,
      }));

      setCropperDialogOpen(false);
      setCurrentCropField("");
      setCurrentImageUrl("");
      setCroppedAreaPixels(null);
      setZoom(1);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const file = e.target.files && e.target.files[0];

    // Find the field configuration to check for disableCrop
    const field = steps
      .flatMap((step) => step.fields)
      .find((f) => f.name === name);

    if (file && file.type.startsWith("image/") && !field?.disableCrop) {
      // For images, show cropper unless disabled
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFilePreviews((prev) => ({
          ...prev,
          [name]: imageUrl,
        }));
        // Open cropper for image files
        openCropper(name, imageUrl);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      // For non-image files, handle normally
      form.setValue(name, file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [name]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = (name: string) => {
    form.setValue(name, "", { shouldValidate: true });
    if (fileInputRefs.current[name]) {
      fileInputRefs.current[name]!.value = "";
    }
    setFilePreviews((prev) => ({ ...prev, [name]: "" }));
    setCroppedImages((prev) => ({ ...prev, [name]: undefined as any }));
  };

  const handleNext = useCallback(async () => {
    const currentStepFields = steps[currentStep - 1]?.fields || [];
    const fieldNames = currentStepFields.map((field) => field.name);

    // Validate current step fields
    const isValid = await form.trigger(fieldNames);

    if (isValid) {
      // Save current form data
      const currentValues = form.getValues();
      setFormData((prev: any) => ({ ...prev, ...currentValues }));

      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  }, [currentStep, form, steps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      // Save current form data before going back
      const currentValues = form.getValues();
      setFormData((prev: any) => ({ ...prev, ...currentValues }));
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, form]);

  const handleStepClick = useCallback(
    async (step: number) => {
      // Allow clicking on previous steps or current step
      if (step <= currentStep) {
        // Save current form data
        const currentValues = form.getValues();
        setFormData((prev: any) => ({ ...prev, ...currentValues }));
        setCurrentStep(step);
      } else {
        // For future steps, validate current step first
        const currentStepFields = steps[currentStep - 1]?.fields || [];
        const fieldNames = currentStepFields.map((field) => field.name);
        const isValid = await form.trigger(fieldNames);

        if (isValid) {
          const currentValues = form.getValues();
          setFormData((prev: any) => ({ ...prev, ...currentValues }));
          setCurrentStep(step);
        }
      }
    },
    [currentStep, form, steps],
  );

  const handleFormSubmit = useCallback(
    async (data: any) => {
      // This function is now only used for Enter key submission on last step
      if (currentStep === steps.length) {
        const finalData = { ...formData, ...data };
        onSubmit(finalData);
      }
    },
    [currentStep, steps.length, formData, onSubmit],
  );

  const applyMask = (value: string, mask: string): string => {
    if (!value) return value;
    const cleanValue = value.replace(/\D/g, "");
    let maskedValue = "";
    let cleanIdx = 0;
    for (let i = 0; i < mask.length && cleanIdx < cleanValue.length; i++) {
      if (mask[i] === "#") {
        maskedValue += cleanValue[cleanIdx];
        cleanIdx++;
      } else {
        maskedValue += mask[i];
        if (cleanValue[cleanIdx] === mask[i]) cleanIdx++;
      }
    }
    return maskedValue;
  };

  const renderField = useCallback(
    (field: Field) => {
      switch (field.type) {
        case "text":
        case "email":
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-11 rounded-xl border-gray-200 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-normal outline-none focus:border-blue-500"
                      type={field.type === "email" ? "email" : "text"}
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label.toLowerCase()}`
                      }
                      {...formField}
                      onChange={(e) => {
                        if (field.mask) {
                          const masked = applyMask(e.target.value, field.mask);
                          formField.onChange(masked);
                        } else {
                          formField.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "date":
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 rounded-xl border-gray-200 focus:ring-1 focus:ring-blue-500 transition-all outline-none focus:border-blue-500"
                      type="date"
                      {...formField}
                      value={
                        formField.value
                          ? formField.value instanceof Date
                            ? formField.value.toISOString().split("T")[0]
                            : formField.value
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "select":
          const options =
            typeof field.options === "function"
              ? field.options(form.watch())
              : field.options;

          const currentEmptyMessage =
            typeof field.emptyMessage === "function"
              ? field.emptyMessage(form.watch())
              : field.emptyMessage;

          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={formField.onChange}
                      value={formField.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 data-[state=open]:ring-1 data-[state=open]:ring-blue-500 data-[state=open]:border-blue-500 transition-all shadow-sm">
                          <SelectValue
                            placeholder={
                              field.placeholder ||
                              `select ${field.label.toLowerCase()}...`
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options && options.length > 0 ? (
                          options.map((option: any) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className=" text-center text-sm text-gray-500">
                            {currentEmptyMessage || "No options available"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "searchable-select":
          const searchableOptions =
            typeof field.options === "function"
              ? field.options(form.watch())
              : field.options;

          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Select2
                      options={searchableOptions || []}
                      value={formField.value?.toString()}
                      onChange={formField.onChange}
                      placeholder={
                        field.placeholder ||
                        `select ${field.label.toLowerCase()}...`
                      }
                      isDisabled={field.disable}
                      className="w-full text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "jodit":
          return (
            <FormField
              control={form.control}
              name={field.name}
              key={field.name}
              render={({ field: formField, fieldState }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm text-gray-700 font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <JoditEditor
                        value={formField.value}
                        config={{
                          // Core Configuration
                          readonly: false,
                          toolbar: true,
                          height: 400,
                          width: "100%",
                          theme: "default",
                          language: "en",
                          placeholder: `Enter ${field.label.toLowerCase()}...`,

                          // Toolbar Configuration - All Available Buttons
                          buttons: [
                            "source",
                            "|",
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "|",
                            "superscript",
                            "subscript",
                            "|",
                            "ul",
                            "ol",
                            "outdent",
                            "indent",
                            "|",
                            "font",
                            "fontsize",
                            "brush",
                            "paragraph",
                            "|",
                            "image",
                            "video",
                            "table",
                            "link",
                            "|",
                            "align",
                            "undo",
                            "redo",
                            "|",
                            "hr",
                            "eraser",
                            "copyformat",
                            "|",
                            "symbol",
                            "fullsize",
                            "print",
                            "preview",
                            "|",
                            "find",
                            "replace",
                            "|",
                            "selectall",
                            "cut",
                            "copy",
                            "paste",
                            "pastetext",
                            "pasteword",
                            "|",
                            "spellcheck",
                            "speechRecognition",
                            "|",
                            "about",
                          ],

                          // Button Sets for Different Screen Sizes
                          buttonsMD: [
                            "bold",
                            "italic",
                            "underline",
                            "|",
                            "ul",
                            "ol",
                            "|",
                            "font",
                            "fontsize",
                            "|",
                            "image",
                            "link",
                            "table",
                            "|",
                            "align",
                            "|",
                            "undo",
                            "redo",
                            "|",
                            "fullsize",
                          ],
                          buttonsSM: [
                            "bold",
                            "italic",
                            "|",
                            "ul",
                            "ol",
                            "|",
                            "image",
                            "link",
                            "|",
                            "fullsize",
                          ],
                          buttonsXS: [
                            "bold",
                            "italic",
                            "|",
                            "image",
                            "|",
                            "fullsize",
                          ],

                          // Editor Behavior
                          allowResizeX: false,
                          allowResizeY: true,
                          minHeight: 200,
                          maxHeight: 800,
                          showCharsCounter: true,
                          showWordsCounter: true,
                          showXPathInStatusbar: false,

                          // Content Settings
                          cleanHTML: {
                            removeEmptyElements: false,
                            fillEmptyParagraph: true,
                            replaceNBSP: true,
                            allowTags: false,
                            denyTags: "script",
                          },

                          // Paste Settings
                          askBeforePasteHTML: false,
                          askBeforePasteFromWord: false,
                          defaultActionOnPaste: "insert_clear_html",

                          // Link Settings
                          link: {
                            followOnDblClick: false,
                            processPastedLink: true,
                            noFollowCheckbox: true,
                            openInNewTabCheckbox: true,
                          },

                          // Table Settings
                          table: {
                            selectionCellStyle:
                              "border: 1px double #1e88e5 !important;",
                            useExtraClassesOptions: false,
                          },

                          // Font Settings - Allow custom font sizes
                          defaultFontSizePoints: "pt",

                          // Image Upload Configuration
                          uploader: {
                            insertImageAsBase64URI: false,
                            imagesExtensions: [
                              "jpg",
                              "png",
                              "jpeg",
                              "gif",
                              "webp",
                              "svg",
                            ],
                            withCredentials: true,
                            format: "json",
                            method: "POST",
                            url: `${API_URL}/api/media`,
                            headers: {
                              Accept: "application/json",
                            },
                            prepareData: function (data: FormData) {
                              // Jodit adds file with default name, we need to change it to 'media'
                              const file =
                                data.get("files[0]") ||
                                data.get("file") ||
                                data.get("files");
                              if (file instanceof File) {
                                // Clear existing entries
                                data.delete("files[0]");
                                data.delete("file");
                                data.delete("files");
                                // Add with correct field name
                                data.append("media", file);
                              }

                              return data;
                            },
                            isSuccess: function (resp: any) {
                              const success =
                                resp &&
                                resp.message &&
                                resp.message.includes("successfully") &&
                                resp.data;
                              return success;
                            },
                            getMessage: function (resp: any) {
                              return (
                                resp?.message || resp?.error || "Upload failed"
                              );
                            },
                            process: function (resp: any) {
                              if (resp && resp.data && resp.data.media) {
                                const mediaUrl = `${API_URL}/public/${resp.data.media}`;
                                return {
                                  files: [mediaUrl],
                                  path: "",
                                  baseurl: "",
                                  error: 0,
                                  msg: resp.message || "Upload successful",
                                };
                              }
                              console.error("Invalid response format:", resp);
                              return {
                                files: [],
                                path: "",
                                baseurl: "",
                                error: 1,
                                msg: resp?.message || "Upload failed",
                              };
                            },
                            defaultHandlerSuccess: function (data: any) {
                              const files = data.files || [];
                              if (files.length) {
                                const imageUrl = files[0];
                                // Try multiple approaches to insert the image
                                try {
                                  // Approach 1: Direct selection API
                                  const selection = (this as any).selection;
                                  if (selection && selection.insertImage) {
                                    selection.insertImage(imageUrl, null, 250);
                                    return;
                                  }

                                  // Approach 2: Editor instance
                                  const editor =
                                    (this as any).editor || (this as any);
                                  if (
                                    editor &&
                                    editor.selection &&
                                    editor.selection.insertImage
                                  ) {
                                    editor.selection.insertImage(
                                      imageUrl,
                                      null,
                                      250,
                                    );
                                    return;
                                  }

                                  // Approach 3: Insert HTML directly
                                  if (
                                    editor &&
                                    editor.selection &&
                                    editor.selection.insertHTML
                                  ) {
                                    editor.selection.insertHTML(
                                      `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 250px;">`,
                                    );
                                    return;
                                  }

                                  console.error(
                                    "Could not find method to insert image",
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error inserting image:",
                                    error,
                                  );
                                }
                              }
                            },
                            defaultHandlerError: function (error: any) {
                              console.error(
                                "Upload error in default handler:",
                                error,
                              );
                              alert(
                                "Upload failed: " +
                                  (error?.message || error || "Unknown error"),
                              );
                            },
                          },

                          // Image Configuration - Disable Browse and Focus on Upload
                          image: {
                            dialogWidth: 600,
                            useImageEditor: true,
                            editSrc: true,
                            editAlt: true,
                            editTitle: true,
                          },

                          // Image Editor Configuration
                          imageeditor: {
                            closeAfterSave: true,
                            width: "85%",
                            height: "85%",
                          },

                          // Video Settings
                          video: {
                            defaultWidth: 600,
                            defaultHeight: 400,
                          },

                          // Spell Check
                          spellcheck: true,

                          // Additional Features
                          useSearch: true,
                          tabIndex: 1,
                          enter: "p",
                          useSplitMode: false,
                          colors: {
                            greyscale: [
                              "#000000",
                              "#434343",
                              "#666666",
                              "#999999",
                              "#B7B7B7",
                              "#CCCCCC",
                              "#D9D9D9",
                              "#EFEFEF",
                              "#F3F3F3",
                              "#FFFFFF",
                            ],
                            palette: [
                              "#980000",
                              "#FF0000",
                              "#FF9900",
                              "#FFFF00",
                              "#00F0F0",
                              "#00FFFF",
                              "#4A86E8",
                              "#0000FF",
                              "#9900FF",
                              "#FF00FF",
                            ],
                            full: [
                              "#E6B8AF",
                              "#F4CCCC",
                              "#FCE5CD",
                              "#FFF2CC",
                              "#D9EAD3",
                              "#D0E0E3",
                              "#C9DAF8",
                              "#CFE2F3",
                              "#D9D2E9",
                              "#EAD1DC",
                              "#DD7E6B",
                              "#EA9999",
                              "#F9CB9C",
                              "#FFE599",
                              "#B6D7A8",
                              "#A2C4C9",
                              "#A4C2F4",
                              "#9FC5E8",
                              "#B4A7D6",
                              "#D5A6BD",
                              "#CC4125",
                              "#E06666",
                              "#F6B26B",
                              "#FFD966",
                              "#93C47D",
                              "#76A5AF",
                              "#6D9EEB",
                              "#6FA8DC",
                              "#8E7CC3",
                              "#C27BA0",
                            ],
                          },

                          // Status Bar
                          statusbar: true,

                          // Events Configuration - Empty to avoid conflicts
                          events: {},
                        }}
                        tabIndex={1}
                        onBlur={(newContent) => formField.onChange(newContent)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-600">
                    {fieldState.error ? fieldState.error.message : null}
                  </FormMessage>
                </FormItem>
              )}
            />
          );

        case "textarea":
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label.toLowerCase()}`
                      }
                      rows={4}
                      {...formField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "list":
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={() => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <ListField form={form} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "objectlist":
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={() => (
                <FormItem>
                  <FormControl>
                    <ObjectListField
                      form={form}
                      name={field.name}
                      fields={field.fields || []}
                      addButtonText={
                        field.name === "insurances"
                          ? "+ Add Insurance"
                          : undefined
                      }
                      addButtonPosition={"bottom" }
                      titleKey={
                        field.name === "insurances" ? "priority" : undefined
                      }
                      titleSuffix={
                        field.name === "insurances" ? " INSURANCE" : ""
                      }
                      headerLabel={field.label}
                      headerRequired={field.required}
                      maxItems={field.maxItems}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        case "file":
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="text-[14px] text-gray-900 mb-2 block font-normal">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {formField.value ? (
                        <div className="relative">
                          {/* Image Preview Section */}
                          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 shadow-sm">
                            <div className="space-y-2">
                              <div className="bg-gray-100 rounded-lg overflow-hidden p-2 flex items-center justify-center min-h-[140px]">
                                {croppedImages[field.name] ? (
                                  <img
                                    src={URL.createObjectURL(
                                      croppedImages[field.name],
                                    )}
                                    alt="Cropped preview"
                                    className="max-w-full max-h-[280px] object-contain rounded-md"
                                  />
                                ) : formField.value instanceof File ? (
                                  <img
                                    src={URL.createObjectURL(formField.value)}
                                    alt="File preview"
                                    className="max-w-full max-h-[280px] object-contain rounded-md"
                                  />
                                ) : filePreviews[field.name] ? (
                                  <img
                                    src={filePreviews[field.name]}
                                    alt="Preview"
                                    className="max-w-full max-h-[280px] object-contain rounded-md"
                                  />
                                ) : typeof formField.value === "string" &&
                                  formField.value ? (
                                  <img
                                    src={`${API_URL}/public/${formField.value}`}
                                    alt="Current image"
                                    className="max-w-full max-h-[280px] object-contain rounded-md"
                                  />
                                ) : null}
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                {croppedImages[field.name]
                                  ? "Cropped image"
                                  : typeof formField.value === "string"
                                    ? formField.value.split("/").pop()
                                    : formField.value instanceof File
                                      ? formField.value.name
                                      : "Image preview"}
                              </p>
                              {/* {(filePreviews[field.name] ||
                                croppedImages[field.name] ||
                                formField.value instanceof File) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    let imageUrl = "";
                                    if (croppedImages[field.name]) {
                                      imageUrl = URL.createObjectURL(croppedImages[field.name]);
                                    } else if (formField.value instanceof File) {
                                      imageUrl = URL.createObjectURL(formField.value);
                                    } else if (filePreviews[field.name]) {
                                      imageUrl = filePreviews[field.name];
                                    }
                                    
                                    if (imageUrl) {
                                      openCropper(field.name, imageUrl);
                                    }
                                  }}
                                  className="w-full gap-2"
                                >
                                  <Crop className="h-4 w-4" />
                                  {croppedImages[field.name]
                                    ? "Re-crop Image"
                                    : "Crop Image"}
                                </Button>
                              )} */}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 rounded-full h-6 w-6 p-0 shadow-md"
                            onClick={() => handleFileDelete(field.name)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        /* File Upload Area */
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-gray-400 transition-colors">
                          <div className="space-y-2">
                            <div className="flex justify-center">
                              <svg
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                            </div>
                            <div>
                              <Input
                                type="file"
                                accept={field.accept || "image/*"}
                                name={field.name}
                                className="hidden"
                                ref={(el) => {
                                  fileInputRefs.current[field.name] = el;
                                }}
                                onChange={(e) =>
                                  handleFileChange(e, field.name)
                                }
                                id={`file-${field.name}`}
                              />
                              <label
                                htmlFor={`file-${field.name}`}
                                className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                              >
                                Choose{" "}
                                {field.accept?.includes("video")
                                  ? "video"
                                  : "document"}{" "}
                                file
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                {field.existingFileName && field.existingFilePath && (
                    <div className="space-y-4">
                      Uploaded Document:{" "}
                      <a
                        href={field.existingFilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {field.existingFileName}
                      </a>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          );

        default:
          return null;
      }
    },
    [form],
  );

  const currentStepConfig = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;

  return (
    <div className="font-outfit animate-in fade-in duration-500 flex flex-col h-full overflow-hidden">
      {/* Header Section - Plain Bold Text */}
      {/* <div className="px-10 pt-10 pb-4 bg-white">
        <h1 className=" text-gray-900 leading-tight">
          {heading1 || "Add New"} {title1}
        </h1>
      </div> */}

      {/* Custom Stepper Section - Circular & Centered */}
      <div className="  mx-auto w-full ">
        <div className="flex items-center justify-between w-full relative z-10">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            const Icon = index === 0 ? User : FileText;

            return (
              <div
                key={stepNumber}
                className="flex flex-col items-center flex-1 relative"
              >
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-3 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-[1px] -z-10",
                      isCompleted ? "bg-[#00a39d]" : "bg-gray-100",
                    )}
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  className="group flex flex-col items-center outline-none"
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                      isActive || isCompleted
                        ? "bg-[#00a39d] text-white"
                        : "bg-gray-50 text-gray-300 group-hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 flex flex-col items-center">
                    <span
                      className={cn(
                        "text-[12px] transition-colors duration-300",
                        isActive || isCompleted
                          ? "text-[#00a39d]"
                          : "text-gray-400",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content - Scrollable Fields & Fixed Navigation */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isLastStep) {
              form.handleSubmit(handleFormSubmit)(e);
            }
          }}
          className="flex flex-col flex-1 min-h-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLastStep) {
              e.preventDefault();
              handleNext();
            }
          }}
        >
          {/* Form Fields Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar min-h-0">
            {/* Step Sub-header Inside Scrollable Area */}
            <div className="mb-8 pt-2">
              <h2 className="text-[20px] text-gray-900 leading-tight">
                {currentStepConfig?.title}
              </h2>
              <p className="text-[14px] text-gray-400 font-medium mt-1">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              {currentStepConfig?.fields.map((field) => (
                <div
                  key={field.name}
                  className={cn(
                    "transition-all duration-300",
                    field.type === "textarea" ||
                      field.type === "jodit" ||
                      field.type === "objectlist" ||
                      field.type === "list" ||
                      field.type === "file"
                      ? "md:col-span-2 lg:col-span-3"
                      : "",
                  )}
                >
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Section - Fixed at Bottom - Right Aligned Compact Buttons */}
          <div className="flex flex-row items-center justify-end gap-3 pt-4 pb-6 px-10 border-t border-gray-100 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="rounded-xl px-8 h-11 bg-primary hover:bg-primary/80 transition-all disabled:opacity-0 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-fit px-10 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-xl h-11 font-bold text-[14px] transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 group"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  const currentStepFields =
                    steps[currentStep - 1]?.fields || [];
                  const fieldNames = currentStepFields.map(
                    (field) => field.name,
                  );
                  const isValid = await form.trigger(fieldNames);
                  if (isValid) {
                    const currentValues = form.getValues();
                    const finalData = { ...formData, ...currentValues };
                    onSubmit(finalData);
                  }
                }}
                className="w-fit px-12 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-xl h-11 font-bold text-[14px] transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loading />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {submitButtonText ||
                        (heading1 === "Create" ? "Create" : "Update")}
                    </span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Image Cropper Dialog */}
      <Dialog
        open={cropperDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeCropper();
        }}
      >
        <DialogContent
          className="gap-0 p-0 sm:max-w-4xl overflow-hidden rounded-[24px] border-none shadow-2xl"
          showCloseButton={false}
        >
          <DialogDescription className="sr-only">
            Adjust your image crop
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b border-gray-100 p-5 text-[16px] font-semibold">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-100"
                  onClick={closeCropper}
                >
                  <X className="w-4 h-4 opacity-60" />
                </Button>
                <span className="text-gray-900">Crop Image</span>
              </div>
              <Button
                className="rounded-lg bg-gray-900 hover:bg-black px-5 h-9 text-sm font-semibold shadow-md shadow-gray-100 transition-all active:scale-95"
                onClick={applyCrop}
                disabled={!currentImageUrl}
              >
                Apply Crop
              </Button>
            </DialogTitle>
          </DialogHeader>

          {currentImageUrl && (
            <div className="bg-gray-900 relative">
              <Cropper
                className="h-[400px] sm:h-[500px]"
                image={currentImageUrl}
                aspectRatio={
                  steps
                    .flatMap((s) => s.fields)
                    .find((f) => f.name === currentCropField)?.landscape
                    ? 4 / 3
                    : steps
                          .flatMap((s) => s.fields)
                          .find((f) => f.name === currentCropField)?.portrait
                      ? 3 / 4
                      : undefined
                }
                zoom={zoom}
                onCropChange={handleCropChange}
                onZoomChange={setZoom}
              >
                <CropperDescription />
                <CropperImage />
                <CropperCropArea className="border-2 border-blue-400 ring-0" />
              </Cropper>
            </div>
          )}

          <DialogFooter className="bg-white px-6 py-6 border-t border-gray-100">
            <div className="mx-auto flex w-full max-w-sm items-center gap-5">
              <ZoomOut
                className="shrink-0 opacity-40 text-gray-500"
                size={18}
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
              <ZoomIn className="shrink-0 opacity-40 text-gray-500" size={18} />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
