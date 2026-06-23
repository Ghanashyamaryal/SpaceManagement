import { type Field } from "@/components/form/form";
import { Role } from "@/enum/enum";

export const userFields: Field[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Super Admin", value: Role.SUPERADMIN },
      { label: "Admin", value: Role.ADMIN },
      { label: "Users", value: Role.USER },
    ],
  },
  {
    name: "branch",
    label: "Branch",
    type: "select",
    required: true,
    options: [],
    // Only Admin and Users belong to a branch; Super Admin is global.
    condition: (formData: any) =>
      formData?.role === Role.ADMIN || formData?.role === Role.USER,
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
];

export const createUserFields: Field[] = [
  ...userFields,
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
  },
];
