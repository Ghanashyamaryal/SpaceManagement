import { Input } from "@/components/ui/Input";
import { Controller } from "react-hook-form";
import { useState, useEffect } from "react";

interface DateRangePickerProps {
  form: any;
  name: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const DateRangePickerField = ({ form, name, required, disabled, className, label }: DateRangePickerProps) => {
  const { control, setValue, watch } = form;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const watchedValue = watch(name);

  useEffect(() => {
    if (watchedValue && typeof watchedValue === 'object') {
      if (watchedValue.start) setStartDate(watchedValue.start);
      if (watchedValue.end) setEndDate(watchedValue.end);
    }
  }, [watchedValue]);

  const handleStartChange = (date: string) => {
    setStartDate(date);
    const dateRange = { start: date, end: endDate };
    setValue(name, dateRange);
    setValue("start_date", date);
    setValue("event_date", date); // Store start date as primary event_date
  };

  const handleEndChange = (date: string) => {
    setEndDate(date);
    const dateRange = { start: startDate, end: date };
    setValue(name, dateRange);
    setValue("end_date", date);
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {label && (
        <label className={`text-sm font-medium leading-none ${
          required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
        }`}>
          {label}
        </label>
      )}
      
      <Controller
        control={control}
        name={name}
        render={() => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => handleStartChange(e.target.value)}
                required={required}
                disabled={disabled}
                placeholder="Start date"
              />
            </div>
            
            <span className="text-muted-foreground text-sm font-medium px-2">
              to
            </span>
            
            <div className="flex-1">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleEndChange(e.target.value)}
                required={required}
                disabled={disabled}
                placeholder="End date"
              />
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default DateRangePickerField;