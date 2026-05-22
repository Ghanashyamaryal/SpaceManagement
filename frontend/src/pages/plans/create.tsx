import { planFields } from "@/components/fields/plan";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { planSchema } from "@/schemas/plan";
import { toast } from "sonner";

interface CreatePlanProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePlan({ onSuccess, onCancel }: CreatePlanProps) {
  const createMutation = useMutation({
    path: "/api/plans",
    method: "POST",
    onSuccess: () => {
      toast.success("Plan created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create plan");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutate({ path: "/api/plans", data });
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={planFields}
        defaultValue={{
          name: "",
          type: "monthly",
          price: 0,
          durationDays: 30,
          maxBookingsPerMonth: 0,
          meetingRoomHours: 0,
          isActive: "true",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={planSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create Plan"
        hideSectiontitle={true}
      />
    </div>
  );
}
