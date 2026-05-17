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
      await createMutation.mutate({ path: "/api/branches", data: submitData });
    } catch (error: any) {
      console.error("Error creating branch:", error);
      toast.error(error.message || "Failed to process request");
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
