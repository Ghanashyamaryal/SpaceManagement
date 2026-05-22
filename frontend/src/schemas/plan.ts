import * as yup from 'yup';

export const planSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    type: yup.string().oneOf(['daily', 'weekly', 'monthly', 'corporate']).required('Type is required'),
    price: yup.number().typeError('Price must be a number').min(0).required('Price is required'),
    durationDays: yup.number().typeError('Duration must be a number').min(1).required('Duration is required'),
    maxBookingsPerMonth: yup.number().typeError('Must be a number').min(0).default(0),
    meetingRoomHours: yup.number().typeError('Must be a number').min(0).default(0),
    isActive: yup.boolean().default(true),
});

export type PlanFormValues = yup.InferType<typeof planSchema>;
