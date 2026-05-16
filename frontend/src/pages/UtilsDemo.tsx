import {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateWithTime,
  formatDateTimeForInput,
  formatDateForInput,
} from "@Utils/date"

import {
  formatNumber,
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
  formatDecimal,
  formatNumberForInput,
  parseNumber,
} from "@Utils/number"

export default function UtilsDemo() {
  const sampleDate = "2026-04-10T10:30:00"
  const number = 1234567.89

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Utils Testing Page</h1>

      {/* DATE UTILS */}
      <div>
        <h2 className="text-xl font-semibold">Date Utils</h2>

        <p>formatDate: {formatDate(sampleDate)}</p>
        <p>formatDateTime: {formatDateTime(sampleDate)}</p>
        <p>formatTime: {formatTime(sampleDate)}</p>
        <p>formatDateWithTime: {formatDateWithTime(sampleDate)}</p>
        <p>formatDateTimeForInput: {formatDateTimeForInput(sampleDate)}</p>
        <p>formatDateForInput: {formatDateForInput(sampleDate)}</p>
      </div>

      {/* NUMBER UTILS */}
      <div>
        <h2 className="text-xl font-semibold">Number Utils</h2>

        <p>formatNumber: {formatNumber(number)}</p>
        <p>formatCurrency: {formatCurrency(number)}</p>
        <p>formatCompactNumber: {formatCompactNumber(number)}</p>
        <p>formatPercentage: {formatPercentage(0.25)}</p>
        <p>formatDecimal: {formatDecimal(number)}</p>
        <p>formatNumberForInput: {formatNumberForInput("1,234,567")}</p>
        <p>parseNumber: {parseNumber("1,234,567")}</p>
      </div>
    </div>
  )
}