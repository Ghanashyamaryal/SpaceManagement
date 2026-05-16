// Format number with commas (1,000,000)
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

// Format currency in Nepali Rupees (Rs. 1,000.00)
export const formatCurrency = (
  value: number,
  currency: string = "NPR"
): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency,
  }).format(value);
};

// Format compact numbers (1K, 1M)
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat("en-NP", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

// Format percentage (0.25 → 25%)
export const formatPercentage = (
  value: number,
  fractionDigits: number = 2
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

// Format decimal (10.456 → 10.46)
export const formatDecimal = (
  value: number,
  digits: number = 2
): string => {
  return value.toFixed(digits);
};

// Format number for input (remove commas)
export const formatNumberForInput = (value: number | string): string => {
  return String(value).replace(/,/g, "");
};

// Parse string safely to number
export const parseNumber = (value: string): number => {
  const parsed = parseFloat(value.replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};