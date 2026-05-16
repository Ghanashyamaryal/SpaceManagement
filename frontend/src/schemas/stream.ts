import * as yup from "yup";

export const streamSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .max(100, "Name must be less than 100 characters"),
});

export type Stream = yup.InferType<typeof streamSchema>;
