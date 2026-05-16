import type { StylesConfig, GroupBase } from "react-select";
import Select from "react-select";
import { cn } from "@/lib/utils";

export interface Select2Props {
  onChange?: (value: any) => void;
  options: { label: string; value: any }[];
  value?: any;
  className?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  noOptionsMessage?: () => string;
  isValidNewOption?: (inputValue: string) => boolean;
  [key: string]: any;
}

export const select2Styles: StylesConfig<any, boolean, GroupBase<any>> = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: "0.75rem",
    backgroundColor: "var(--background)",
    borderColor: state.isFocused ? "var(--ring)" : "var(--border)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--ring)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--ring)" : "var(--border)",
    },
    minHeight: "2.25rem",
    fontSize: "0.875rem",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
        ? "var(--accent)"
        : "transparent",
    color: state.isSelected ? "var(--primary-foreground)" : "var(--foreground)",
    fontSize: "0.875rem",
    "&:active": {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
    },
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "0.75rem",
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    zIndex: 9999,
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "var(--foreground)",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "var(--muted-foreground)",
  }),
  input: (base: any) => ({
    ...base,
    color: "var(--foreground)",
  }),
};

export const Select2 = ({
  options,
  value,
  onChange,
  className,
  placeholder,
  isDisabled,
  isClearable = false,
  isLoading = false,
  noOptionsMessage,
  ...rest
}: Select2Props) => {
  const handleChange = (selectedOption: any) => {
    onChange?.(selectedOption ? selectedOption.value : "");
  };

  const selectedValue =
    options && value !== undefined && value !== ""
      ? options.find((opt) => String(opt.value) === String(value)) || null
      : null;

  return (
    <Select
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isLoading={isLoading}
      noOptionsMessage={noOptionsMessage}
      styles={select2Styles as any}
      className={cn("text-sm", className)}
      {...rest}
    />
  );
};

export default Select2;
