import { type Field } from '@/components/form/form';
export const ComboFields: Field[] = [
  {
    name: 'classId',
    label: 'Class',
    type: 'searchable-select',
    options: [],
    required: true,
    placeholder: 'Select Class...',
  },
  {
    name: 'streamId',
    label: 'Stream',
    type: 'searchable-select',
    options: [],
    required: true,
    placeholder: 'Select Stream...',
  },
  {
    name: 'groupId',
    label: 'Group',
    type: 'searchable-select',
    options: [],
    required: true,
    placeholder: 'Select Group...',
  },
];
