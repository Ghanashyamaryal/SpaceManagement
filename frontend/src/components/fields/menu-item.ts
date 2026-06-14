import type { Field } from "@/components/form/form";

export const menuItemFields: Field[] = [
  {
    name: "name",
    label: "Item Name",
    type: "text",
    placeholder: "Enter item name",
    required: true,
  },
  {
    name: "branch",
    label: "Branch",
    type: "select",
    placeholder: "Select branch",
    required: true,
    options: [],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Select category",
    required: true,
    options: [
      { label: "Breakfast", value: "breakfast" },
      { label: "Lunch", value: "lunch" },
      { label: "Snack", value: "snack" },
      { label: "Beverage", value: "beverage" },
      { label: "Dessert", value: "dessert" },
    ],
  },
  {
    name: "price",
    label: "Price (₹)",
    type: "number",
    placeholder: "Enter price",
    required: true,
  },
  {
    name: "prepTimeMinutes",
    label: "Prep Time (minutes)",
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
    label: "Item Image",
    type: "file",
    accept: "image/*",
  },
  {
    name: "isAvailable",
    label: "Availability",
    type: "select",
    options: [
      { label: "Available", value: "true" },
      { label: "Sold Out", value: "false" },
    ],
  },
];
