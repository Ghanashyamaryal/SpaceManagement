import * as yup from 'yup';

export const branchSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().optional(),
  phone: yup.string().optional(),
  email: yup.string().email('Invalid email').optional(),
  operatingHours: yup.string().optional(),
  imageUrl: yup.mixed().optional(),
  status: yup.string().oneOf(['active', 'inactive']).default('active'),
});

export type BranchFormValues = yup.InferType<typeof branchSchema>;
