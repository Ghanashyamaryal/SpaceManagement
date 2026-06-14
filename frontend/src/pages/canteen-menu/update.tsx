import Loading from "@/components/common/Loading";
import { menuItemFields } from "@/components/fields/menu-item";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { menuItemSchema } from "@/schemas/menu-item";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface UpdateMenuItemProps {
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateMenuItem({
  id: propId,
  onSuccess,
  onCancel,
}: UpdateMenuItemProps) {
  const { id: paramsId } = useParams();
  const id = propId || paramsId;

  const { data: itemData, isLoading } = useFetch({
    path: `/api/canteen/menu/${id}`,
    queryKey: `menu-item-${id}`,
  });
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

  const updateMutation = useMutation({
    path: `/api/canteen/menu/${id}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("Menu item updated");
      onSuccess?.();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to update item");
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
      await updateMutation.mutate({ path: `/api/canteen/menu/${id}`, data: submitData });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    }
  };

  if (isLoading) {
    return <Loading className="min-h-50" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = (itemData as any)?.menuItem;
  const branchValue = item?.branch?._id ?? item?.branch ?? "";

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          ...item,
          branch: branchValue,
          isAvailable: item?.isAvailable ? "true" : "false",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={menuItemSchema}
        onCancel={onCancel}
        isSubmitting={updateMutation.isLoading}
        submitText="Update Item"
        hideSectiontitle={true}
      />
    </div>
  );
}
