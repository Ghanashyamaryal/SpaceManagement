
## Utility Functions

### Date Utilities

```tsx
import {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateWithTime,
  formatDateTimeForInput,
  formatDateForInput,
} from "@Utils/date"

export default function DateUtilsExample() {
  const sampleDate = "2026-04-10T10:30:00"

  return (
    <div className="space-y-2">
      <p>formatDate: {formatDate(sampleDate)}</p>
      {/* Output: Apr 10, 2026 */}
      
      <p>formatDateTime: {formatDateTime(sampleDate)}</p>
      {/* Output: Apr 10, 2026, 10:30 AM */}
      
      <p>formatTime: {formatTime(sampleDate)}</p>
      {/* Output: 10:30 AM */}
      
      <p>formatDateWithTime: {formatDateWithTime(sampleDate)}</p>
      {/* Output: Friday, April 10, 2026 10:30 AM */}
      
      <p>formatDateTimeForInput: {formatDateTimeForInput(sampleDate)}</p>
      {/* Output: 2026-04-10T10:30 */}
      
      <p>formatDateForInput: {formatDateForInput(sampleDate)}</p>
      {/* Output: 2026-04-10 */}
    </div>
  )
}
```

### Number Utilities

```tsx
import {
  formatNumber,
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
  formatDecimal,
  formatNumberForInput,
  parseNumber,
} from "@Utils/number"

export default function NumberUtilsExample() {
  const number = 1234567.89

  return (
    <div className="space-y-2">
      <p>formatNumber: {formatNumber(number)}</p>
      {/* Output: 1,234,567.89 */}
      
      <p>formatCurrency: {formatCurrency(number)}</p>
      {/* Output: Rs. 1,234,567.89 (NPR) */}
      
      <p>formatCompactNumber: {formatCompactNumber(number)}</p>
      {/* Output: 1.2M */}
      
      <p>formatPercentage: {formatPercentage(0.25)}</p>
      {/* Output: 25% */}
      
      <p>formatDecimal: {formatDecimal(number)}</p>
      {/* Output: 1,234,567.89 */}
      
      <p>formatNumberForInput: {formatNumberForInput("1,234,567")}</p>
      {/* Output: 1234567 (removes commas) */}
      
      <p>parseNumber: {parseNumber("1,234,567")}</p>
      {/* Output: 1234567 */}
    </div>
  )
}
```

---