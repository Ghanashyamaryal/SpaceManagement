import { branchFields } from "@/components/fields/branch";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { branchSchema } from "@/schemas/branch";
import { toast } from "sonner";

interface CreateBranchProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateBranch({ onSuccess, onCancel }: CreateBranchProps) {
  const createMutation = useMutation({
    path: "/api/branches",
    method: "POST",
    onSuccess: () => {
      toast.success("Branch created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create branch");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutate({ path: "/api/branches", data });
    } catch (error) {
      console.error("Error creating branch:", error);
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={branchFields}
        defaultValue={{
          name: "",
          address: "",
          city: "",
          phone: "",
          email: "",
          operatingHours: "8 AM - 10 PM",
          status: "active",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={branchSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create Branch"
      />
    </div>
  );
}
