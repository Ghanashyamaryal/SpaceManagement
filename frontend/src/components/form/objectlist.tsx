import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Controller, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import ListField from "./listfield";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Select2 } from "../ui/Select2";

type FieldOption = {
  value: string | number;
  label: string;
};

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: "input" | "textarea" | "list" | "select" | "date" | "file" | "searchable-select";
  options?: FieldOption[] | ((data: any) => FieldOption[]);
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  grid?: { xs?: number; sm?: number; md?: number; lg?: number };
  accept?: string;
}

interface ObjectListFieldProps {
  form: any;
  name: string;
  fields: FieldConfig[];
  addButtonText?: string;
  addButtonPosition?: "top" | "bottom";
  titleKey?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  headerLabel?: string;
  headerRequired?: boolean;
  maxItems?: number;
}

const ObjectListField = ({
  form,
  name,
  fields: fieldConfigs,
  addButtonText = "+ Add Insurance Details",
  addButtonPosition = "bottom",
  titleKey,
  titlePrefix = "",
  titleSuffix = "",
  headerLabel,
  headerRequired,
  maxItems,
}: ObjectListFieldProps) => {
  const { control, register, getValues, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchData = watch();

  const createEmptyObject = () => {
    return fieldConfigs.reduce(
      (obj, field) => {
        if (field.type === "list") {
          obj[field.key] = [];
        } else if (field.type === "select") {
          obj[field.key] = field.defaultValue || "";
        } else if (field.type === "file") {
          obj[field.key] = null;
        } else {
          obj[field.key] = field.defaultValue || "";
        }
        return obj;
      },
      {} as Record<string, any>,
    );
  };

  useEffect(() => {
    const currentValues = getValues(name) || [];
    if (fields.length === 0 && currentValues.length > 0) {
      currentValues.forEach((val: any) => append(val));
    }
  }, [fields.length, append, getValues, name]);

  const renderAddButton = () => {
    const isAtMaxLimit = !!(maxItems && fields.length >= maxItems);
    return (
    <Button
      type="button"
      variant="outline"
        disabled={isAtMaxLimit}
      className={cn(
          "rounded-xl h-11 bg-primary text-white font-semibold border-none px-6",
          isAtMaxLimit ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
        )}
      onClick={() => append(createEmptyObject())}
        title={isAtMaxLimit ? `Maximum ${maxItems} insurance plans allowed` : ""}
    >
      {addButtonText}
    </Button>
  );
  };

  return (
    <div className="flex flex-col gap-6">
      {addButtonPosition === "top" && (
        <div className="flex justify-between items-center">
          {headerLabel ? (
            <span className="text-[14px] text-foreground font-normal">
              {headerLabel}
              {headerRequired && <span className="text-red-500 ml-1">*</span>}
            </span>
          ) : <div />}
          {renderAddButton()}
        </div>
      )}

      {fields.map((field, index) => {
        const itemData = watch(`${name}.${index}`);
        const displayTitle = titleKey ? itemData?.[titleKey] : null;

        return (
          <div
            key={field.id}
            className="border border-border flex flex-col rounded-[24px] p-8 bg-card shadow-sm gap-6 relative group"
          >
            {/* Header / Remove Button */}
            <div className="flex justify-between items-center">
              {displayTitle && (
                <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">
                  {titlePrefix}{displayTitle}{titleSuffix}
                </h3>
              )}
              {!displayTitle && <div></div>}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                onClick={() => remove(index)}
              >
                ✕
              </Button>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-6">
              {fieldConfigs.map((fieldConfig) => {
                const gridSpan = fieldConfig.grid || { xs: 12, md: 6, lg: 4 };
                const gridClass = cn(
                  gridSpan.xs ? `col-span-${gridSpan.xs}` : "col-span-12",
                  gridSpan.sm ? `md:col-span-${gridSpan.sm}` : "md:col-span-6",
                  gridSpan.md ? `lg:col-span-${fieldConfig.type === 'file' ? '12' : gridSpan.md}` : "",
                );

                return (
                  <div key={fieldConfig.key} className={gridClass}>
                    <label className="block text-[14px] font-normal text-muted-foreground mb-2">
                      {fieldConfig.label}
                      {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {fieldConfig.type === "textarea" ? (
                      <Textarea
                        disabled={fieldConfig.disabled}
                        placeholder={fieldConfig.placeholder}
                        className="rounded-xl border-input focus:ring-1 focus:ring-ring min-h-[100px] bg-background"
                        {...register(`${name}.${index}.${fieldConfig.key}`)}
                      />
                    ) : fieldConfig.type === "list" ? (
                      <ListField
                        form={form}
                        name={`${name}.${index}.${fieldConfig.key}`}
                      />
                    ) : fieldConfig.type === "select" ? (
                      <Controller
                        name={`${name}.${index}.${fieldConfig.key}`}
                        control={control}
                        render={({ field: selectField }) => {
                          const options = typeof fieldConfig.options === 'function' 
                            ? (fieldConfig.options as any)(watchData) 
                            : fieldConfig.options;

                          return (
                            <Select
                              value={selectField.value ?? undefined}
                              onValueChange={selectField.onChange}
                              disabled={fieldConfig.disabled}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={fieldConfig.placeholder || `Select ${fieldConfig.label.toLowerCase()}...`}
                                />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border shadow-xl bg-popover">
                                <SelectGroup>
                                  {options?.map((option: any) => (
                                    <SelectItem
                                      key={option.value}
                                      value={String(option.value)}
                                      className="rounded-lg"
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          );
                        }}
                      />
                    ) : fieldConfig.type === "searchable-select" ? (
                      <Controller
                        name={`${name}.${index}.${fieldConfig.key}`}
                        control={control}
                        render={({ field: selectField }) => {
                          const options = typeof fieldConfig.options === 'function' 
                            ? (fieldConfig.options as any)(watchData) 
                            : fieldConfig.options;

                          return (
                            <Select2
                              options={options || []}
                              value={String(selectField.value || "")}
                              onChange={selectField.onChange}
                              placeholder={fieldConfig.placeholder || `Select ${fieldConfig.label.toLowerCase()}...`}
                              isDisabled={fieldConfig.disabled}
                              className="w-full text-sm"
                            />
                          );
                        }}
                      />
                    ) : fieldConfig.type === "date" ? (
                      <Input
                        type="date"
                        className="h-11 rounded-xl border-input focus:ring-1 focus:ring-ring transition-all bg-background"
                        {...register(`${name}.${index}.${fieldConfig.key}`)}
                      />
                    ) : fieldConfig.type === "file" ? (
                      <Controller
                        name={`${name}.${index}.${fieldConfig.key}`}
                        control={control}
                        render={({ field: fileField }) => (
                          <div className="space-y-2">
                            {fileField.value ? (
                              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-foreground truncate">
                                    {fileField.value instanceof File ? fileField.value.name : typeof fileField.value === "string"
                                        ? fileField.value
                                        : fileField.value?.name ||
                                          fileField.value?.document ||
                                          "Uploaded Document"}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 rounded-full p-0 hover:bg-red-50 hover:text-red-500"
                                  onClick={() => setValue(`${name}.${index}.${fieldConfig.key}`, null, { shouldValidate: true })}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border border-dashed border-input rounded-xl p-6 transition-all hover:bg-muted/30 hover:border-primary/50 group/upload cursor-pointer relative">
                                <input
                                  type="file"
                                  accept={fieldConfig.accept}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      fileField.onChange(file);
                                    }
                                  }}
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover/upload:bg-primary/20 transition-colors">
                                    <Upload className="h-5 w-5 text-muted-foreground group-hover/upload:text-primary" />
                                  </div>
                                  <div className="text-sm font-medium text-muted-foreground group-hover/upload:text-primary">
                                    {fieldConfig.placeholder || "Click to upload document"}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      />
                    ) : (
                      <Input
                        className="h-11 rounded-xl border-input focus:ring-1 focus:ring-ring transition-all bg-background font-outfit"
                        placeholder={fieldConfig.placeholder}
                        type={fieldConfig.type === 'input' ? 'text' : fieldConfig.type}
                        {...register(`${name}.${index}.${fieldConfig.key}`)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {addButtonPosition === "bottom" && (
        <div className="mt-2">
          {renderAddButton()}
        </div>
      )}
    </div>
  );
};

export default ObjectListField;

/* 
Usage Examples:

// For phases with title and description:
<ObjectListField 
  form={form}
  name="phases"
  fields={[
    { key: "title", label: "Title", placeholder: "e.g., Phase 1: Application" },
    { key: "description", label: "Description", placeholder: "Enter description..." }
  ]}
  addButtonText="+ Add Phase"
/>

// For team members:
<ObjectListField 
  form={form}
  name="team_members"
  fields={[
    { key: "name", label: "Name", placeholder: "Enter member name" },
    { key: "role", label: "Role", placeholder: "Enter role" },
    { key: "email", label: "Email", placeholder: "Enter email address" }
  ]}
  addButtonText="+ Add Team Member"
/>

// For FAQ with textarea:
<ObjectListField 
  form={form}
  name="faqs"
  fields={[
    { key: "question", label: "Question", placeholder: "Enter question" },
    { key: "answer", label: "Answer", placeholder: "Enter answer", type: "textarea" }
  ]}
  addButtonText="+ Add FAQ"
/>

// For services with list fields:
<ObjectListField 
  form={form}
  name="services"
  fields={[
    { key: "heading", label: "Heading", placeholder: "Enter service heading" },
    { key: "outcome", label: "Outcome", placeholder: "Enter service outcome" },
    { key: "services", label: "Services", placeholder: "Enter services", type: "list" },
    { key: "description", label: "Description", placeholder: "Enter description", type: "textarea" },
    { key: "short_description", label: "Short Description", placeholder: "Enter short description" }
  ]}
  addButtonText="+ Add Service"
/>

// For simple key-value pairs:
<ObjectListField 
  form={form}
  name="settings"
  fields={[
    { key: "key", label: "Setting Key", placeholder: "e.g., max_users" },
    { key: "value", label: "Setting Value", placeholder: "Enter value" }
  ]}
/>
*/
