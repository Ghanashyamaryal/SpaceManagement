import { type Field } from "@/components/form/form";

export const branchFields: Field[] = [
  {
    name: "name",
    label: "Branch Name",
    type: "text",
    required: true,
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    required: true,
  },
  {
    name: "city",
    label: "City",
    type: "text",
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
  },
  {
    name: "operatingHours",
    label: "Operating Hours",
    type: "text",
    placeholder: "e.g. 8 AM - 10 PM",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    name: "imageUrl",
    label: "Branch Image",
    type: "file",
    accept: "image/*",
  },
];
