import Loading from "@/components/common/Loading";
import { userFields } from "@/components/fields/user";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { userSchema } from "@/schemas/user";
import { useMemo } from "react";
import { toast } from "sonner";

interface UpdateUserProps {
  id: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateUser({
  id,
  onSuccess,
  onCancel,
}: UpdateUserProps) {
  const { data: userData, isLoading } = useFetch({
    path: `/api/users/${id}`,
    queryKey: `user-${id}`,
  });

  const { data: branchData } = useFetch({ path: "/api/branches" });
  const branches = branchData?.branches || [];

  const fields = useMemo(() => {
    return userFields.map((field) => {
      if (field.name === "branch") {
        return {
          ...field,
          options: branches.map((b: any) => ({ label: b.name, value: b._id })),
        };
      }
      return field;
    });
  }, [branches]);

  const user = userData?.user || userData;
  const defaultValue = useMemo(() => {
    if (!user) return user;
    // Branch comes back populated as an object; the select expects its id.
    const branch =
      user.branch && typeof user.branch === "object"
        ? user.branch._id
        : user.branch || "";
    return { ...user, branch };
  }, [user]);

  const updateMutation = useMutation({
    path: `/api/users/${id}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("User updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await updateMutation.mutate({ path: `/api/users/${id}`, data });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  if (isLoading) {
    return <Loading className="min-h-[200px]" />;
  }

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={defaultValue}
        onSubmit={handleFormSubmit}
        validationSchema={userSchema}
        onCancel={onCancel}
        isSubmitting={updateMutation.isLoading}
        submitText="Update User"
      />
    </div>
  );
}
