import type { Field } from "@/components/form/form";

export const bookingFields: Field[] = [
  {
    name: "user",
    label: "User",
    type: "select",
    placeholder: "Select User",
    required: true,
    options: [], // populated dynamically
  },
  {
    name: "workspace",
    label: "Workspace",
    type: "select",
    placeholder: "Select Workspace",
    required: true,
    options: [], // populated dynamically
  },
  {
    name: "branch",
    label: "Branch",
    type: "select",
    placeholder: "Select Branch",
    required: true,
    options: [], // populated dynamically
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
  },
  {
    name: "startTime",
    label: "Start Time",
    type: "time",
    required: true,
  },
  {
    name: "endTime",
    label: "End Time",
    type: "time",
    required: true,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Confirmed", value: "confirmed" },
      { label: "Cancelled", value: "cancelled" },
      { label: "Completed", value: "completed" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];
