import { createUserFields } from "@/components/fields/user";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { createUserSchema } from "@/schemas/user";
import { toast } from "sonner";
import { Role } from "@/enum/enum";

interface CreateUserProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateUser({ onSuccess, onCancel }: CreateUserProps) {
  const createMutation = useMutation({
    path: "/api/users",
    method: "POST",
    onSuccess: () => {
      toast.success("User created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutate({ path: "/api/users", data });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={createUserFields}
        defaultValue={{
          name: "",
          email: "",
          role: Role.USER,
          status: "active",
          password: "",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={createUserSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create User"
      />
    </div>
  );
}
