import Loading from "@/components/common/Loading";
import { planFields } from "@/components/fields/plan";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { planSchema } from "@/schemas/plan";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface UpdatePlanProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdatePlan({
  id: propId,
  onSuccess,
  onCancel,
}: UpdatePlanProps) {
  const { id: paramsId } = useParams();
  const id = propId || paramsId;
  const { data: planData, isLoading } = useFetch({
    path: `/api/plans/${id}`,
    queryKey: `plan-${id}`,
  });

  const updateMutation = useMutation({
    path: `/api/plans/${id}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("Plan updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update plan");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await updateMutation.mutate({ path: `/api/plans/${id}`, data });
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  if (isLoading) {
    return <Loading className="min-h-[200px]" />;
  }

  const plan = planData?.plan;

  return (
    <div className="space-y-6">
      <FormComponent
        fields={planFields}
        defaultValue={{
          ...plan,
          isActive: plan?.isActive ? "true" : "false",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={planSchema}
        onCancel={onCancel}
        isSubmitting={updateMutation.isLoading}
        submitText="Update Plan"
        hideSectiontitle={true}
      />
    </div>
  );
}
