import * as yup from "yup";

export const signupSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  phone: yup
    .string()
    .required("Phone number is required"),
  branch: yup
    .string()
    .required("Branch is required"),
});

export type SignupInput = yup.InferType<typeof signupSchema>;
