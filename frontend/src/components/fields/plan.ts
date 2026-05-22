import type { Field } from "@/components/form/form";

export const planFields: Field[] = [
  {
    name: "name",
    label: "Plan Name",
    type: "text",
    placeholder: "Enter plan name",
    required: true,
  },
  {
    name: "type",
    label: "Plan Type",
    type: "select",
    placeholder: "Select plan type",
    required: true,
    options: [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
      { label: "Corporate", value: "corporate" },
    ],
  },
  {
    name: "price",
    label: "Price",
    type: "number",
    placeholder: "Enter price",
    required: true,
  },
  {
    name: "durationDays",
    label: "Duration (Days)",
    type: "number",
    placeholder: "Enter duration in days",
    required: true,
  },
  {
    name: "maxBookingsPerMonth",
    label: "Max Bookings Per Month",
    type: "number",
    placeholder: "0 for unlimited",
  },
  {
    name: "meetingRoomHours",
    label: "Meeting Room Hours",
    type: "number",
    placeholder: "0",
  },
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];
