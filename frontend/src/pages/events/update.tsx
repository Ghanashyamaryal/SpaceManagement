import Loading from "@/components/common/Loading";
import { eventFields } from "@/components/fields/event";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { eventSchema } from "@/schemas/event";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface UpdateEventProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateEvent({
  id: propId,
  onSuccess,
  onCancel,
}: UpdateEventProps) {
  const { id: paramsId } = useParams();
  const id = propId || paramsId;
  const { data: eventData, isLoading } = useFetch({
    path: `/api/events/${id}`,
    queryKey: `event-${id}`,
  });

  const { data: branchData } = useFetch({ path: "/api/branches" });
  const branches = branchData?.branches || [];

  const fields = useMemo(() => {
    return eventFields.map((field) => {
      if (field.name === "branch_id") {
        return {
          ...field,
          options: branches.map((b: any) => ({ label: b.name, value: b._id })),
        };
      }
      return field;
    });
  }, [branches]);

  const updateMutation = useMutation({
    path: `/api/events/${id}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("Event updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await updateMutation.mutate({ path: `/api/events/${id}`, data });
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  if (isLoading) {
    return <Loading className="min-h-[200px]" />;
  }

  const event = eventData?.event;

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          ...event,
          date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
          branch_id: event?.branch_id?._id || event?.branch_id,
        }}
        onSubmit={handleFormSubmit}
        validationSchema={eventSchema}
        onCancel={onCancel}
        isSubmitting={updateMutation.isLoading}
        submitText="Update Event"
        hideSectiontitle={true}
      />
    </div>
  );
}
