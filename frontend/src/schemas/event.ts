import * as yup from 'yup';

export const eventSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().optional(),
    event_type: yup.string().oneOf(['networking', 'workshop', 'startup_pitch', 'tech_meetup', 'training', 'other']).default('networking'),
    branch_id: yup.string().optional(),
    date: yup.date().required('Date is required'),
    start_time: yup.string().optional(),
    end_time: yup.string().optional(),
    capacity: yup.number().typeError('Capacity must be a number').min(0).default(0),
    status: yup.string().oneOf(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
});

export type EventFormValues = yup.InferType<typeof eventSchema>;
