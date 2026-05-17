import type { Field } from "@/components/form/form";
import { WORKSPACE_TYPES } from "@/types/types";

export const workspaceFields: Field[] = [
  {
    name: "name",
    label: "Workspace Name",
    type: "text",
    placeholder: "Enter workspace name",
    required: true,
  },
  {
    name: "branch",
    label: "Branch",
    type: "select",
    placeholder: "Select branch",
    required: true,
    // Note: Options should be fetched or passed dynamically
    options: [], 
  },
  {
    name: "type",
    label: "Workspace Type",
    type: "select",
    placeholder: "Select type",
    required: true,
    options: WORKSPACE_TYPES.map((type) => ({
      label: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: type,
    })),
  },
  {
    name: "capacity",
    label: "Capacity",
    type: "number",
    placeholder: "Enter capacity",
    required: true,
  },
  {
    name: "floor",
    label: "Floor",
    type: "text",
    placeholder: "Enter floor (optional)",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options: [
      { label: "Available", value: "available" },
      { label: "Occupied", value: "occupied" },
      { label: "Maintenance", value: "maintenance" },
    ],
  },
  {
    name: "pricePerHour",
    label: "Price Per Hour",
    type: "number",
    placeholder: "0",
  },
  {
    name: "pricePerDay",
    label: "Price Per Day",
    type: "number",
    placeholder: "0",
  },
  {
    name: "pricePerMonth",
    label: "Price Per Month",
    type: "number",
    placeholder: "0",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
  },
  {
    name: "imageUrl",
    label: "Workspace Image",
    type: "file",
    accept: "image/*",
  },
];
