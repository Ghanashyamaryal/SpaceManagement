import * as yup from 'yup';

export const bookingSchema = yup.object().shape({
    user: yup.string().required('User is required'),
    workspace: yup.string().required('Workspace is required'),
    branch: yup.string().required('Branch is required'),
    date: yup.date().required('Date is required'),
    startTime: yup.string().required('Start Time is required'),
    endTime: yup.string().required('End Time is required'),
    amount: yup.number().typeError('Amount must be a number').min(0).required('Amount is required'),
    status: yup.string().oneOf(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
    notes: yup.string().optional(),
});

export type BookingFormValues = yup.InferType<typeof bookingSchema>;
