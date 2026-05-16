import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Select2, select2Styles } from "@/components/ui/Select2";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/TextArea";
import { API_URL } from "@/constant/constant";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import JoditEditor from "jodit-react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFilePdf } from "react-icons/fa";
import { Link } from "react-router-dom";
import CreatableSelect from "react-select/creatable";

import Loading from "@/components/common/Loading";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/Cropper";
import MultipleSelector, { type Option } from "@/components/ui/MultiSelect";
import DateRangePickerField from "./date-range-picker";
import DynamicObjectListField from "./dynamic-object-list";
import ListImageField from "./list_image";
import ListField from "./listfield";
import ObjectListField from "./objectlist";
import PasswordField from "./password_field";

// Type definitions for better type safety
type FieldOption = {
  value: string;
  label: string;
};

export type Field = {
  name: string;
  label: string;
  type: string;
  separator?: string;
  fields?: {
    key: string;
    label: string;
    placeholder: string;
  }[];
  options?: FieldOption[];
  accept?: string;
  disable?: boolean;
  multi?: boolean;
  link?: string;
  landscape?: boolean;
  portrait?: boolean;
  required?: boolean;
  hint?: string;
  description?: string;
  cropWidth?: number; // Add custom crop width
  cropHeight?: number; // Add custom crop height
  placeholder?: string; // Add placeholder support
  mask?: string; // Add mask support
  step?: string; // Add step support for number inputs
  condition?: (formData: any) => boolean; // Conditional visibility based on form data
  fullWidth?: boolean; // Add fullWidth support
  onCreateOption?: (inputValue: string) => void; // Add onCreateOption support
  isClearable?: boolean; // Add isClearable support
  hideCreateLabel?: boolean; // Add hideCreateLabel support
};

type CreateFormProps = {
  fields: Field[];
  defaultValue: any;
  onSubmit: (data: any) => void;
  onFieldChange?: (name: string, value: any) => void;
  validationSchema: any;
  title1?: string;
  hideSectiontitle?: boolean;
  titleLink2?: string;
  isSubmitting?: boolean;
  heading1?: string;
  submitClassName?: string;
  onCancel?: () => void;
  cancelText?: string;
  submitIcon?: React.ReactNode;
  submitText?: string;
  formRefData?: (data: any) => void; // Callback to pass form data to parent component
  formRef?: React.MutableRefObject<{
    setValue: (name: string, value: any) => void;
  } | null>; // Expose form methods to parent
  gridCols?: number; // Add gridCols support
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

export function FormComponent({
  fields,
  defaultValue,
  onSubmit,
  onFieldChange,
  validationSchema,
  title1 = "",
  isSubmitting,
  heading1,
  submitClassName,
  onCancel,
  cancelText,
  submitIcon,
  submitText,
  formRefData,
  formRef,
  hideSectiontitle,
  gridCols,
}: CreateFormProps) {
  const form = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultValue,
  });

  // Reset form when defaultValue changes (important for update forms)
  // Use JSON serialization to detect actual content change and avoid re-resetting on every render
  const defaultValueRef = useRef<string>("");
  useEffect(() => {
    const serialized = JSON.stringify(defaultValue);
    if (defaultValue && serialized !== defaultValueRef.current) {
      defaultValueRef.current = serialized;
      form.reset(defaultValue);
    }
  }, [defaultValue, form]);

  // Expose form.setValue to parent via formRef
  useEffect(() => {
    if (formRef) {
      formRef.current = { setValue: form.setValue };
    }
  }, [formRef, form.setValue]);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>(
    {},
  );
  const [customOptions, setCustomOptions] = useState<{
    [fieldName: string]: FieldOption[];
  }>({});

  const handleCreateOptionInternal = (
    fieldName: string,
    inputValue: string,
    externalOnCreate?: (val: string) => void,
  ) => {
    const newValue = {
      label: inputValue,
      value: inputValue.toLowerCase().replace(/\W/g, "-"),
    };
    setCustomOptions((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), newValue],
    }));
    form.setValue(fieldName, newValue.value);
    onFieldChange?.(fieldName, newValue.value);
    externalOnCreate?.(inputValue);
  };

  // Cropping state
  const [cropperDialogOpen, setCropperDialogOpen] = useState(false);
  const [currentCropField, setCurrentCropField] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const [croppedImages, setCroppedImages] = useState<{ [key: string]: File }>(
    {},
  );

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
    // Reset file input when dialog is closed without applying
    if (currentCropField && fileInputRefs.current[currentCropField]) {
      fileInputRefs.current[currentCropField]!.value = "";
    }

    // Clear preview if no cropped image exists
    if (currentCropField && !croppedImages[currentCropField]) {
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
      const currentField = fields.find(
        (field) => field.name === currentCropField,
      );

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

    if (file && file.type.startsWith("image/")) {
      // For images, show cropper
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

  const handleSubmit = async (data: any) => {
    onSubmit(data);
  };

  // Watch form values for conditional field visibility
  const formData = form.watch();
  formRefData && formRefData(formData); // Pass form data to parent if formRefData callback is provided

  // Filter fields based on condition function
  const filterFieldsByCondition = (fieldsList: Field[]) => {
    return fieldsList.filter((field) => {
      if (field.condition) {
        return field.condition(formData);
      }
      return true;
    });
  };

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

  // Organize fields into sections for better layout
  const allMediaFields = fields.filter(
    (field) => field.type === "file" || field.type === "listimage",
  );
  const allEditorFields = fields.filter((field) => field.type === "jodit");
  const allStandardFields = fields.filter(
    (field) => !["file", "jodit"].includes(field.type),
  );

  // Apply conditional filtering
  const mediaFields = filterFieldsByCondition(allMediaFields);
  const editorFields = filterFieldsByCondition(allEditorFields);
  const standardFields = filterFieldsByCondition(allStandardFields);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      {(heading1 || title1) && (
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {heading1 ? `${heading1} ${title1}` : title1}
          </h1>
          <p className="text-sm text-muted-foreground">
            {heading1
              ? `${heading1} the details of the ${title1.toLowerCase()} below.`
              : `Manage the details of the ${title1.toLowerCase()} below.`}
          </p>
        </div>
      )}

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Standard Fields Section */}
          {standardFields.length > 0 && (
            <div className="space-y-3">
              <h2
                className={`text-lg font-normal text-foreground border-b border-border pb-1 ${hideSectiontitle ? "hidden" : ""}`}
              >
                Basic Information
              </h2>
              <div
                className={`grid gap-2.5 ${
                  gridCols
                    ? `grid-cols-1 lg:grid-cols-${gridCols}`
                    : standardFields.length > 3
                      ? "grid-cols-1 lg:grid-cols-2"
                      : "grid-cols-1"
                }`}
              >
                {standardFields.map((item) => (
                  <FormField
                    control={form.control}
                    name={item.name}
                    key={item.name}
                    render={({ field, fieldState }) => (
                      <FormItem
                        className={`space-y-1 ${
                          item.fullWidth ||
                          item.type === "list" ||
                          item.type === "objectlist"
                            ? "lg:col-span-2"
                            : ""
                        }`}
                      >
                        <FormLabel className="text-sm font-normal text-foreground">
                          {item.label}
                          {item.required && (
                            <span className="text-destructive">*</span>
                          )}
                          {item.hint && ` (${item.hint})`}
                        </FormLabel>

                        <FormControl>
                          {item.type === "select" ? (
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                onFieldChange?.(field.name, value);
                              }}
                              value={field.value || ""}
                              disabled={item.disable}
                            >
                              <SelectTrigger className="h-9 border-input focus:border-ring focus:ring-1 focus:ring-ring shadow-sm w-full text-foreground font-normal bg-background">
                                <SelectValue
                                  placeholder={`select ${item.label.toLowerCase()}...`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>{item.label}</SelectLabel>
                                  {/* //TODO: check the items  */}

                                  {item.options?.map((option) => (
                                    <SelectItem
                                      value={option.value}
                                      key={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          ) : item.type === "multiselect" ? (
                            <MultipleSelector
                              commandProps={{
                                label: `Select ${item.label.toLowerCase()}...`,
                              }}
                              disabled={item.disable}
                              value={
                                Array.isArray(field.value) ? field.value : []
                              }
                              onChange={(value: Option[]) =>
                                field.onChange(value)
                              }
                              defaultOptions={
                                item.options?.map((option) => ({
                                  value: option.value,
                                  label: option.label,
                                })) || []
                              }
                              placeholder={`Select ${item.label.toLowerCase()}...`}
                              hideClearAllButton
                              hidePlaceholderWhenSelected
                              emptyIndicator={
                                <p className="text-center text-sm">
                                  No results found
                                </p>
                              }
                            />
                          ) : item.type === "checkbox" ? (
                            <div className="flex items-center space-x-2 pt-1">
                              <Checkbox
                                id={item.name}
                                checked={!!field.value}
                                disabled={item.disable}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked)
                                }
                                className="border-input"
                              />
                              <FormLabel
                                htmlFor={item.name}
                                className="text-sm text-muted-foreground font-normal cursor-pointer"
                              >
                                {item.label}
                                {item.required && (
                                  <span className="text-destructive">*</span>
                                )}
                                {item.hint && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    ({item.hint})
                                  </span>
                                )}
                              </FormLabel>
                            </div>
                          ) : item.type === "checkboxgroup" ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {item.options?.map((option) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`${item.name}-${option.value}`}
                                      checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(option.value)
                                      }
                                      disabled={item.disable}
                                      onCheckedChange={(checked) => {
                                        const currentValue = Array.isArray(
                                          field.value,
                                        )
                                          ? field.value
                                          : [];
                                        if (checked) {
                                          field.onChange([
                                            ...currentValue,
                                            option.value,
                                          ]);
                                        } else {
                                          field.onChange(
                                            currentValue.filter(
                                              (val: string) =>
                                                val !== option.value,
                                            ),
                                          );
                                        }
                                      }}
                                      className="border-input"
                                    />
                                    <FormLabel
                                      htmlFor={`${item.name}-${option.value}`}
                                      className="text-sm text-muted-foreground font-normal cursor-pointer"
                                    >
                                      {option.label}
                                    </FormLabel>
                                  </div>
                                ))}
                              </div>
                              {item.options && item.options.length > 0 && (
                                <div className="flex gap-2 pt-2 border-t border-border">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const allValues =
                                        item.options?.map((opt) => opt.value) ||
                                        [];
                                      field.onChange(allValues);
                                    }}
                                    className="text-xs"
                                  >
                                    Select All
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange([])}
                                    className="text-xs"
                                  >
                                    Clear All
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : item.type === "daterangepicker" ? (
                            <DateRangePickerField
                              form={form}
                              name={item.name}
                              required={item.required}
                              disabled={item.disable}
                              // placeholder={{
                              //   start: item.placeholder?.start || "Start date",
                              //   end: item.placeholder?.end || "End date"
                              // }}
                              className="lg:col-span-2"
                            />
                          ) : item.type === "textarea" ? (
                            <Textarea
                              placeholder={`Enter ${item.label.toLowerCase()}...`}
                              className="min-h-[75px] resize-y border-input focus:border-ring focus:ring-1 focus:ring-ring shadow-sm text-foreground font-normal bg-background"
                              {...field}
                              disabled={item.disable}
                            />
                          ) : item.type === "number" ? (
                            <Input
                              type="number"
                              step={item.step || "any"}
                              placeholder={
                                item.placeholder ||
                                `Enter ${item.label.toLowerCase()}...`
                              }
                              className="h-9 border-input focus:border-ring focus:ring-1 focus:ring-ring shadow-sm text-foreground font-normal bg-background"
                              {...field}
                              min={0}
                              disabled={item.disable}
                            />
                          ) : item.type === "list" ? (
                            <div className="lg:col-span-2">
                              <ListField form={form} name={item.name} />
                            </div>
                          ) : item.type === "objectlist" ? (
                            <div className="lg:col-span-2">
                              <ObjectListField
                                form={form}
                                name={item.name}
                                fields={item.fields || []}
                              />
                            </div>
                          ) : item.type === "dynamicobjectlist" ? (
                            <div className="lg:col-span-2">
                              <DynamicObjectListField
                                form={form}
                                name={item.name}
                                fields={item.fields || []}
                              />
                            </div>
                          ) : item.type === "password" ? (
                            <div className="lg:col-span-2">
                              <PasswordField form={form} {...field} />
                            </div>
                          ) : item.type === "creatable-select" ? (
                            <CreatableSelect
                              isClearable={
                                item.isClearable !== undefined
                                  ? item.isClearable
                                  : false
                              }
                              isDisabled={item.disable}
                              isLoading={false}
                              noOptionsMessage={() => "No results found"}
                              isValidNewOption={(inputValue) => {
                                if (item.hideCreateLabel) return false;
                                return !!inputValue;
                              }}
                              formatCreateLabel={
                                item.hideCreateLabel ? () => null : undefined
                              }
                              onChange={(newValue: any) => {
                                field.onChange(newValue?.value || "");
                                onFieldChange?.(
                                  field.name,
                                  newValue?.value || "",
                                );
                              }}
                              onCreateOption={(val) =>
                                handleCreateOptionInternal(
                                  item.name,
                                  val,
                                  item.onCreateOption,
                                )
                              }
                              options={[
                                ...(item.options || []),
                                ...(customOptions[item.name] || []),
                              ]}
                              value={
                                [
                                  ...(item.options || []),
                                  ...(customOptions[item.name] || []),
                                ].find((opt) => opt.value === field.value) ||
                                null
                              }
                              placeholder={
                                item.placeholder ||
                                `Select or create ${item.label.toLowerCase()}...`
                              }
                              className="w-full text-sm"
                              styles={select2Styles}
                            />
                          ) : item.type === "searchable-select" ? (
                            <Select2
                              isClearable={
                                item.isClearable !== undefined
                                  ? item.isClearable
                                  : false
                              }
                              isDisabled={item.disable}
                              isLoading={false}
                              noOptionsMessage={() => "No results found"}
                              onChange={(value: string) => {
                                field.onChange(value);
                                onFieldChange?.(field.name, value);
                              }}
                              options={item.options || []}
                              value={field.value || ""}
                              placeholder={
                                item.placeholder ||
                                `Select ${item.label.toLowerCase()}...`
                              }
                              className="w-full text-sm"
                            />
                          ) : (
                            <Input
                              type={item.type}
                              placeholder={
                                item.placeholder ||
                                `Enter ${item.label.toLowerCase()}...`
                              }
                              className="h-9 border-input focus:border-ring focus:ring-1 focus:ring-ring shadow-sm text-foreground font-normal bg-background"
                              {...field}
                              onChange={(e) => {
                                if (item.mask) {
                                  const masked = applyMask(
                                    e.target.value,
                                    item.mask,
                                  );
                                  field.onChange(masked);
                                } else {
                                  field.onChange(e);
                                }
                              }}
                              value={
                                item.type === "date" && field.value
                                  ? field.value instanceof Date
                                    ? field.value.toISOString().split("T")[0]
                                    : typeof field.value === "string" &&
                                        field.value.includes("T")
                                      ? field.value.split("T")[0]
                                      : field.value
                                  : field.value || ""
                              }
                              disabled={item.disable}
                            />
                          )}
                        </FormControl>

                        {item.description && (
                          <p className="text-sm text-muted-foreground opacity-70">
                            {item.description}
                          </p>
                        )}

                        <FormMessage className="text-xs text-red-600">
                          {fieldState.error ? fieldState.error.message : null}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rich Text Editor Section */}
          {editorFields.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground border-b border-border pb-1">
                Content Editor
              </h2>
              <div className="space-y-3">
                {editorFields.map((item) => (
                  <FormField
                    control={form.control}
                    name={item.name}
                    key={item.name}
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {item.label}
                        </FormLabel>
                        <FormControl>
                          <div className="border border-border rounded-lg overflow-hidden shadow-sm">
                            <JoditEditor
                              value={field.value}
                              config={{
                                // Core Configuration
                                readonly: false,
                                toolbar: true,
                                height: 400,
                                width: "100%",
                                theme: "default",
                                language: "en",
                                placeholder: `Enter ${item.label.toLowerCase()}...`,

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
                                      resp?.message ||
                                      resp?.error ||
                                      "Upload failed"
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
                                        msg:
                                          resp.message || "Upload successful",
                                      };
                                    }
                                    console.error(
                                      "Invalid response format:",
                                      resp,
                                    );
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
                                      try {
                                        // Approach 1: Direct selection API
                                        const selection = (this as any)
                                          .selection;
                                        if (
                                          selection &&
                                          selection.insertImage
                                        ) {
                                          selection.insertImage(
                                            imageUrl,
                                            null,
                                            250,
                                          );
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
                                        (error?.message ||
                                          error ||
                                          "Unknown error"),
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
                              onBlur={(newContent) =>
                                field.onChange(newContent)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-600">
                          {fieldState.error ? fieldState.error.message : null}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Media Files Section */}
          {mediaFields.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground border-b border-border pb-1">
                Media Files
              </h2>
              <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                {mediaFields.map((item) => (
                  <FormField
                    control={form.control}
                    name={item.name}
                    key={item.name}
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {item.label}
                          {item.required && (
                            <span className="text-destructive">*</span>
                          )}
                          {item.hint && (
                            <span className="text-muted-foreground">
                              {" "}
                              ({item.hint})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {item.multi ? (
                              <ListImageField form={form} name={item.name} />
                            ) : field.value ? (
                              <div className="relative">
                                {/* Media Preview Section */}
                                <div className="border border-border rounded-xl p-3 bg-muted/30 shadow-sm">
                                  {item.accept === "pdf/*" ? (
                                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                                      <FaFilePdf className="text-red-600 h-6 w-6 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <Link
                                          to={
                                            typeof field.value === "string"
                                              ? field.value
                                              : "#"
                                          }
                                          target="_blank"
                                          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                                        >
                                          {typeof field.value === "string"
                                            ? field.value.split("/").pop() ||
                                              "PDF Document"
                                            : "PDF Document"}
                                        </Link>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Click to view document
                                        </p>
                                      </div>
                                    </div>
                                  ) : item.accept === "video/*" ? (
                                    <div className="space-y-2">
                                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                        {field.value instanceof File ||
                                        field.value instanceof Blob ? (
                                          <video
                                            controls
                                            className="w-full h-full object-contain"
                                            preload="metadata"
                                          >
                                            <source
                                              src={URL.createObjectURL(
                                                field.value,
                                              )}
                                              type={
                                                field.value.type || "video/mp4"
                                              }
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>
                                        ) : filePreviews[item.name] ? (
                                          <video
                                            controls
                                            className="w-full h-full object-contain"
                                            preload="metadata"
                                          >
                                            <source
                                              src={filePreviews[item.name]}
                                              type="video/mp4"
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>
                                        ) : (
                                          <video
                                            controls
                                            className="w-full h-full object-contain"
                                            preload="metadata"
                                          >
                                            <source
                                              src={`${API_URL}/public/${field.value}`}
                                              type="video/mp4"
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground text-center">
                                        Video:{" "}
                                        {typeof field.value === "string"
                                          ? field.value.split("/").pop()
                                          : "video file"}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="bg-muted/50 rounded-lg overflow-hidden p-2 flex items-center justify-center min-h-[140px]">
                                        {croppedImages[item.name] ? (
                                          <img
                                            src={URL.createObjectURL(
                                              croppedImages[item.name],
                                            )}
                                            alt="Cropped preview"
                                            className="max-w-full max-h-[280px] object-contain rounded-md"
                                          />
                                        ) : filePreviews[item.name] ? (
                                          <img
                                            src={filePreviews[item.name]}
                                            alt="Preview"
                                            className="max-w-full max-h-[280px] object-contain rounded-md"
                                          />
                                        ) : typeof field.value === "string" &&
                                          field.value ? (
                                          <img
                                            src={`${API_URL}/public/${field.value}`}
                                            alt="Current image"
                                            className="max-w-full max-h-[280px] object-contain rounded-md"
                                          />
                                        ) : null}
                                      </div>
                                      <p className="text-xs text-muted-foreground text-center">
                                        {croppedImages[item.name]
                                          ? "Cropped image"
                                          : typeof field.value === "string"
                                            ? field.value.split("/").pop()
                                            : "Image preview"}
                                      </p>
                                      {/* {(filePreviews[item.name] ||
                                        croppedImages[item.name]) && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const imageUrl =
                                              filePreviews[item.name] ||
                                              (croppedImages[item.name]
                                                ? URL.createObjectURL(
                                                    croppedImages[item.name]
                                                  )
                                                : "");
                                            if (imageUrl) {
                                              openCropper(item.name, imageUrl);
                                            }
                                          }}
                                          className="w-full gap-2"
                                        >
                                          <Crop className="h-4 w-4" />
                                          {croppedImages[item.name]
                                            ? "Re-crop Image"
                                            : "Crop Image"}
                                        </Button>
                                      )} */}
                                    </div>
                                  )}
                                  {/* </>
                                  )} */}
                                </div>

                                {/* Delete Button */}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-1 -right-1 rounded-full h-6 w-6 p-0 shadow-md"
                                  onClick={() => handleFileDelete(item.name)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              /* File Upload Area */
                              <div className="border-2 border-dashed border-input rounded-xl p-5 text-center hover:border-primary/50 transition-colors bg-muted/20">
                                <div className="space-y-2">
                                  <div className="flex justify-center">
                                    <svg
                                      className="h-8 w-8 text-muted-foreground"
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
                                      accept={item.accept || "image/*"}
                                      name={item.name}
                                      className="hidden"
                                      ref={(el) => {
                                        fileInputRefs.current[item.name] = el;
                                      }}
                                      onChange={(e) =>
                                        handleFileChange(e, item.name)
                                      }
                                      id={`file-${item.name}`}
                                    />
                                    <label
                                      htmlFor={`file-${item.name}`}
                                      className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                      Choose{" "}
                                      {item.accept?.includes("video")
                                        ? "video"
                                        : item.accept?.includes("pdf")
                                          ? "PDF"
                                          : "image"}{" "}
                                      file
                                    </label>
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

                                        {currentImageUrl ? (
                                          item.landscape ? (
                                            <Cropper
                                              className="h-96 sm:h-120"
                                              image={currentImageUrl}
                                              aspectRatio={4 / 3}
                                              zoom={zoom}
                                              onCropChange={handleCropChange}
                                              onZoomChange={setZoom}
                                            >
                                              <CropperDescription />
                                              <CropperImage />
                                              <CropperCropArea />
                                            </Cropper>
                                          ) : item.portrait ? (
                                            <Cropper
                                              className="h-96 sm:h-120"
                                              image={currentImageUrl}
                                              aspectRatio={3 / 4}
                                              zoom={zoom}
                                              onCropChange={handleCropChange}
                                              onZoomChange={setZoom}
                                            >
                                              <CropperDescription />
                                              <CropperImage />
                                              <CropperCropArea />
                                            </Cropper>
                                          ) : (
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
                                          )
                                        ) : null}
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
                                              onValueChange={(value) =>
                                                setZoom(value[0])
                                              }
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
                                  <p className="text-xs text-gray-500">
                                    {item.accept?.includes("video")
                                      ? "MP4, WebM, or other video formats"
                                      : item.accept?.includes("pdf")
                                        ? "PDF documents only"
                                        : "PNG, JPG, GIF up to 10MB"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-600">
                          {fieldState.error ? fieldState.error.message : null}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 border-t border-border flex justify-end items-center gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="h-9 px-8 bg-gray-100 border-gray-200 hover:bg-gray-200 text-black hover:text-black rounded-xl text-[15px] transition-all border"
              >
                {cancelText || "Cancel"}
              </Button>
            )}
            {isSubmitting ? (
              <Button
                type="button"
                disabled
                className={cn("h-11 px-8 rounded-xl", submitClassName)}
              >
                <Loading login="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                className={cn(
                  "h-10 px-8 bg-button-primary hover:bg-button-primary/80 text-white font-bold transition-all active:scale-95 flex items-center gap-2 rounded-xl",
                  submitClassName,
                )}
              >
                {submitIcon}
                {submitText ||
                  (!heading1 ? "Save Information" : `${heading1} Information`)}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
