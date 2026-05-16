import * as yup from "yup";

export const classSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: yup.string().required("Description is required").default(""),
});

export type Class = yup.InferType<typeof classSchema>;
