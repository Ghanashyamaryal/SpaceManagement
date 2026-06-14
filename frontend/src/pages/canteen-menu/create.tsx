import { menuItemFields } from "@/components/fields/menu-item";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { menuItemSchema } from "@/schemas/menu-item";
import { useMemo } from "react";
import { toast } from "sonner";

interface CreateMenuItemProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateMenuItem({ onSuccess, onCancel }: CreateMenuItemProps) {
  const { data: branchData } = useFetch({ path: "/api/branches" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const branches = (branchData as any)?.branches || [];

  const fields = useMemo(() => {
    return menuItemFields.map((field) => {
      if (field.name === "branch") {
        return {
          ...field,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: branches.map((b: any) => ({ label: b.name, value: b._id })),
        };
      }
      return field;
    });
  }, [branches]);

  const createMutation = useMutation({
    path: "/api/canteen/menu",
    method: "POST",
    onSuccess: () => {
      toast.success("Menu item created");
      onSuccess?.();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to create item");
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    try {
      const submitData = { ...data, isAvailable: data.isAvailable !== "false" };
      if (submitData.imageUrl instanceof File) {
        const formData = new FormData();
        formData.append("image", submitData.imageUrl);
        formData.append("folder", "canteen");
        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload/image", {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        const json = await res.json();
        submitData.imageUrl = json.url;
      } else if (!submitData.imageUrl || typeof submitData.imageUrl !== "string") {
        delete submitData.imageUrl;
      }
      await createMutation.mutate({ path: "/api/canteen/menu", data: submitData });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          name: "",
          branch: "",
          category: "snack",
          price: 0,
          prepTimeMinutes: 0,
          description: "",
          isAvailable: "true",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={menuItemSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create Item"
        hideSectiontitle={true}
      />
    </div>
  );
}
