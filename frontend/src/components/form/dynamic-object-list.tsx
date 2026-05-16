import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Select2 } from "../ui/Select2";
import ListField from "./listfield";

type FieldOption = {
  value: string | number;
  label: string;
};

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: "input" | "textarea" | "list" | "select" | "searchable-select";
  options?: FieldOption[];
  defaultValue?: string;
  disabled?: boolean;
}

interface ObjectListFieldProps {
  form: any;
  name: string;
  fields: FieldConfig[];
  addButtonText?: string;
}



const DynamicObjectListField = ({
  form,
  name,
  fields: fieldConfigs,
  addButtonText = "+ Add Context Access",
}: ObjectListFieldProps) => {
  const { control, register, getValues } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });



  // Create empty object based on field configurations
  const createEmptyObject = () => {
    return fieldConfigs.reduce(
      (obj, field) => {
        if (field.type === "list") {
          obj[field.key] = [];
        } else if (field.type === "select") {
          obj[field.key] = "";
        } else {
          obj[field.key] = "";
        }
        return obj;
      },
      {} as Record<string, any>,
    );
  };

  // Initialize fields with existing data or ensure at least one empty input
  useEffect(() => {
    const currentValues = getValues(name) || [];

    if (fields.length === 0) {
      if (currentValues.length > 0) {
        // populate with existing values
        currentValues.forEach((val: any) => append(val));
      } else {
        // ensure at least one empty object
        // append(createEmptyObject());
      }
    }
  }, [fields, append, getValues, name, fieldConfigs]);

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {


        return (
          <div
            key={field.id}
            className="border flex justify-between items-start rounded-lg p-4 bg-muted/20 border-border gap-8"
          >
            <div className="flex flex-col gap-3 w-full">
              {fieldConfigs.map((fieldConfig) => (
                <div key={fieldConfig.key}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {fieldConfig.label}
                  </label>
                  {fieldConfig.type === "textarea" ? (
                    <Textarea
                      disabled={fieldConfig.disabled}
                      placeholder={fieldConfig.placeholder}
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
                      control={form.control}
                      render={({ field }) => {
                        const options = fieldConfig.options;
                        return (
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                            disabled={!options?.length}
                          >
                            <SelectTrigger className="h-9 w-[70%]">
                              <SelectValue
                                placeholder={`Select ${fieldConfig.label}`}
                              />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>{fieldConfig.label}</SelectLabel>

                                {options?.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
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
                      control={form.control}
                      render={({ field }) => {
                        const options = fieldConfig.options;
                        const normalizedOptions = (options || []).map((o) => ({
                          value: String(o.value),
                          label: o.label,
                        }));
                        return (
                          <Select2
                            options={normalizedOptions}
                            value={String(field.value || "")}
                            onChange={field.onChange}
                            placeholder={
                              fieldConfig.placeholder ||
                              `Select ${fieldConfig.label.toLowerCase()}...`
                            }
                            isDisabled={
                              !normalizedOptions.length || fieldConfig.disabled
                            }
                            className="w-[70%] text-sm"
                          />
                        );
                      }}
                    />
                  ) : (
                    <Input
                      placeholder={fieldConfig.placeholder}
                      type={fieldConfig.type}
                      {...register(`${name}.${index}.${fieldConfig.key}`)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                ✕
              </Button>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        onClick={() => append(createEmptyObject())}
      >
        {addButtonText}
      </Button>
    </div>
  );
};

export default DynamicObjectListField;
