import type { Field } from "@/components/form/form";

export const eventFields: Field[] = [
  {
    name: "title",
    label: "Event Title",
    type: "text",
    placeholder: "Enter event title",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
  },
  {
    name: "event_type",
    label: "Event Type",
    type: "select",
    placeholder: "Select event type",
    options: [
      { label: "Networking", value: "networking" },
      { label: "Workshop", value: "workshop" },
      { label: "Startup Pitch", value: "startup_pitch" },
      { label: "Tech Meetup", value: "tech_meetup" },
      { label: "Training", value: "training" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "branch_id",
    label: "Branch",
    type: "select",
    placeholder: "Select branch",
    options: [], // populated dynamically
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
  },
  {
    name: "start_time",
    label: "Start Time",
    type: "time",
  },
  {
    name: "end_time",
    label: "End Time",
    type: "time",
  },
  {
    name: "capacity",
    label: "Capacity",
    type: "number",
    placeholder: "0",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Upcoming", value: "upcoming" },
      { label: "Ongoing", value: "ongoing" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
];
