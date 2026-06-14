import * as yup from "yup";

export const menuItemSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  branch: yup.string().required("Branch is required"),
  category: yup.string().required("Category is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(0)
    .required("Price is required"),
  prepTimeMinutes: yup
    .number()
    .typeError("Prep time must be a number")
    .min(0)
    .default(0),
  description: yup.string().default(""),
  imageUrl: yup.mixed(),
  isAvailable: yup.boolean().default(true),
});

export type MenuItemFormValues = yup.InferType<typeof menuItemSchema>;
