import * as yup from "yup";

export const comboSchema = yup.object().shape({
  classId: yup.string().required("Class is required"),
  streamId: yup.string().required("Stream is required"),
  groupId: yup.string().required("Group is required"),
});

export type Combo = yup.InferType<typeof comboSchema>;
