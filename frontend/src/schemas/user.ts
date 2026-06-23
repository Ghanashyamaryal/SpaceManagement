import * as yup from 'yup';
import { Role } from '@/enum/enum';

export const userSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().oneOf(Object.values(Role)).required('Role is required'),
  branch: yup.string().when('role', {
    is: (role: string) => role === Role.ADMIN || role === Role.USER,
    then: (schema) => schema.required('Branch is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  status: yup.string().oneOf(['active', 'inactive']).default('active'),
  password: yup.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const createUserSchema = userSchema.shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export type UserFormValues = yup.InferType<typeof userSchema>;
