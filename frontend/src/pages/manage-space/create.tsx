import { workspaceFields } from "@/components/fields/manage-spaces";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { workspaceSchema } from "@/schemas/manage-space";
import { toast } from "sonner";
import { useFetch } from "@/hooks/queryFn";
import { useMemo } from "react";

interface CreateWorkspaceProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateWorkspace({ onSuccess, onCancel }: CreateWorkspaceProps) {
  const { data: branchData } = useFetch({ path: "/api/branches" });
  const branches = branchData?.branches || [];

  const fields = useMemo(() => {
    return workspaceFields.map((field) => {
      if (field.name === "branch") {
        return {
          ...field,
          options: branches.map((b: any) => ({ label: b.name, value: b._id })),
        };
      }
      return field;
    });
  }, [branches]);

  const createMutation = useMutation({
    path: "/api/workspaces",
    method: "POST",
    onSuccess: () => {
      toast.success("Workspace created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create workspace");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutate({ path: "/api/workspaces", data });
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          name: "",
          type: "hot_desk",
          capacity: 1,
          status: "available",
          pricePerHour: 0,
          pricePerDay: 0,
          pricePerMonth: 0,
        }}
        onSubmit={handleFormSubmit}
        validationSchema={workspaceSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create Workspace"
        hideSectiontitle={true}
      />
    </div>
  );
}
