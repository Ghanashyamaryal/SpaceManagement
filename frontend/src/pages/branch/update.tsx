import Loading from "@/components/common/Loading";
import { branchFields } from "@/components/fields/branch";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { branchSchema } from "@/schemas/branch";
import { toast } from "sonner";

interface UpdateBranchProps {
  id: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateBranch({
  id,
  onSuccess,
  onCancel,
}: UpdateBranchProps) {
  const { data: branchData, isLoading } = useFetch({
    path: `/api/branches/${id}`,
    queryKey: `branch-${id}`,
  });

  const updateMutation = useMutation({
    path: `/api/branches/${id}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("Branch updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update branch");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      let submitData = { ...data };
      if (submitData.imageUrl instanceof File) {
        const formData = new FormData();
        formData.append("image", submitData.imageUrl);
        formData.append("folder", "branches");
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        const json = await res.json();
        submitData.imageUrl = json.url;
      }
      await updateMutation.mutate({ path: `/api/branches/${id}`, data: submitData });
    } catch (error: any) {
      console.error("Error updating branch:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  if (isLoading) {
    return <Loading className="min-h-[200px]" />;
  }

  return (
    <div className="space-y-6">
      <FormComponent
        fields={branchFields}
        defaultValue={branchData?.branch}
        onSubmit={handleFormSubmit}
        validationSchema={branchSchema}
        onCancel={onCancel}
        isSubmitting={updateMutation.isLoading}
        submitText="Update Branch"
      />
    </div>
  );
}
