import React from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";
import { select2Styles } from "../Select2";

export interface Option {
  label: string;
  value: string;
}

export interface MultipleSelectorProps {
  onChange?: (value: Option[]) => void;
  options?: Option[];
  defaultOptions?: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  value?: Option[];
  commandProps?: Record<string, any>;
  hideClearAllButton?: boolean;
  hidePlaceholderWhenSelected?: boolean;
  emptyIndicator?: React.ReactNode;
  [key: string]: any;
}

const MultipleSelector = ({
  options,
  defaultOptions,
  onChange,
  placeholder,
  disabled,
  className,
  value,
  hideClearAllButton,
  emptyIndicator: _emptyIndicator,
  commandProps: _commandProps,
  hidePlaceholderWhenSelected: _hidePlaceholderWhenSelected,
  ...rest
}: MultipleSelectorProps) => {
  const handleChange = (selectedOptions: any) => {
    onChange?.(selectedOptions ? (selectedOptions as Option[]) : []);
  };

  const selectOptions = options || defaultOptions;

  return (
    <Select
      isMulti
      options={selectOptions}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable={!hideClearAllButton}
      styles={select2Styles as any}
      className={cn("text-sm", className)}
      {...rest}
    />
  );
};

export default MultipleSelector;
