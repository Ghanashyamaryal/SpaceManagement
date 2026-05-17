import Loading from "@/components/common/Loading";
import { workspaceFields } from "@/components/fields/manage-spaces";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { workspaceSchema } from "@/schemas/manage-space";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface UpdateWorkspaceProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateWorkspace({
  id: propId,
  onSuccess,
  onCancel,
}: UpdateWorkspaceProps) {
  const { id: paramsId } = useParams();
  const id = propId || paramsId;
  const { data: workspaceData, isLoading } = useFetch({
    path: `/api/workspaces/${id}`,
    queryKey: `workspace-${id}`,
    // enabled: !!id, // existing useFetch doesn't support 'enabled' prop, it just takes url
  });

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

  const updateMutation = useMutation({
    path: `/api/workspaces/${id}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("Workspace updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update workspace");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      let submitData = { ...data };
      if (submitData.imageUrl instanceof File) {
        const formData = new FormData();
        formData.append("image", submitData.imageUrl);
        formData.append("folder", "workspaces");
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
      await updateMutation.mutate({ path: `/api/workspaces/${id}`, data: submitData });
    } catch (error: any) {
      console.error("Error updating workspace:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  if (isLoading) {
    return <Loading className="min-h-[200px]" />;
  }

  const workspace = workspaceData?.workspace;

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          ...workspace,
          branch: workspace?.branch?._id || workspace?.branch,
        }}
        onSubmit={handleFormSubmit}
        validationSchema={workspaceSchema}
        onCancel={onCancel}
        isSubmitting={updateMutation.isLoading}
        submitText="Update Workspace"
        hideSectiontitle={true}
      />
    </div>
  );
}
