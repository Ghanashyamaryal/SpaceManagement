import * as yup from 'yup';

export const workspaceSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    branch: yup.string().required('Branch is required'),
    type: yup.string().required('Type is required'),
    capacity: yup.number().typeError('Capacity must be a number').min(1, 'Capacity must be at least 1').required('Capacity is required'),
    floor: yup.string().optional(),
    status: yup.string().oneOf(['available', 'occupied', 'maintenance']).default('available'),
    pricePerHour: yup.number().typeError('Price must be a number').min(0).default(0),
    pricePerDay: yup.number().typeError('Price must be a number').min(0).default(0),
    pricePerMonth: yup.number().typeError('Price must be a number').min(0).default(0),
    description: yup.string().optional(),
    imageUrl: yup.mixed().optional(),
});

export type WorkspaceFormValues = yup.InferType<typeof workspaceSchema>;
