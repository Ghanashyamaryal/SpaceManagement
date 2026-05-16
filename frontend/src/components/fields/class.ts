import type { Field } from "@/components/form/form";

export const classFields: Field[] = [
  {
    name: "name",
    label: "Class Name",
    type: "text",
    placeholder: "Enter class name",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter class description",
    required: false,
  },
];
