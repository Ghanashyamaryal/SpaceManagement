import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFieldArray } from "react-hook-form";
import { useEffect } from "react";

const ListField = ({ form, name }: { form: any; name: string }) => {
  const { control, register, getValues } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name, // e.g., "service_disciplines"
  });

  // Initialize fields with existing data or ensure at least one empty input
  useEffect(() => {
    const currentValues = getValues(name) || [];

    if (fields.length === 0) {
      if (currentValues.length > 0) {
        // populate with existing values
        currentValues.forEach((val: string) => append(val));
      } else {
        // ensure at least one empty input
        append("");
      }
    }
  }, [fields, append, getValues, name]);

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-center">
          <Input
            placeholder={`Item ${index + 1}`}
            {...register(`${name}.${index}`)} // array of strings
          />
          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
          >
            ✕
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append("")} // add new input
      >
        + Add Item
      </Button>
    </div>
  );
};

export default ListField;