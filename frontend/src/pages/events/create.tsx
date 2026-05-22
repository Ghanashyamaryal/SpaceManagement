import { eventFields } from "@/components/fields/event";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { eventSchema } from "@/schemas/event";
import { useMemo } from "react";
import { toast } from "sonner";

interface CreateEventProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateEvent({ onSuccess, onCancel }: CreateEventProps) {
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

  const createMutation = useMutation({
    path: "/api/events",
    method: "POST",
    onSuccess: () => {
      toast.success("Event created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutate({ path: "/api/events", data });
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          title: "",
          description: "",
          event_type: "networking",
          capacity: 0,
          status: "upcoming",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={eventSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create Event"
        hideSectiontitle={true}
      />
    </div>
  );
}
