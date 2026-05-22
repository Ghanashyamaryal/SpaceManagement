import { bookingFields } from "@/components/fields/booking";
import { FormComponent } from "@/components/form/form";
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { bookingSchema } from "@/schemas/booking";
import { useMemo } from "react";
import { toast } from "sonner";

interface CreateBookingProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateBooking({ onSuccess, onCancel }: CreateBookingProps) {
  const { data: branchData } = useFetch({ path: "/api/branches" });
  const branches = branchData?.branches || [];

  const { data: workspaceData } = useFetch({ path: "/api/workspaces" });
  const workspaces = workspaceData?.workspaces || [];

  const { data: userData } = useFetch({ path: "/api/users" });
  const users = userData?.users || [];

  const fields = useMemo(() => {
    return bookingFields.map((field) => {
      if (field.name === "branch") {
        return {
          ...field,
          options: branches.map((b: any) => ({ label: b.name, value: b._id })),
        };
      }
      if (field.name === "workspace") {
        return {
          ...field,
          options: workspaces.map((w: any) => ({ label: w.name, value: w._id })),
        };
      }
      if (field.name === "user") {
        return {
          ...field,
          options: users.map((u: any) => ({ label: u.name, value: u._id })),
        };
      }
      return field;
    });
  }, [branches, workspaces, users]);

  const createMutation = useMutation({
    path: "/api/bookings",
    method: "POST",
    onSuccess: () => {
      toast.success("Booking created successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create booking");
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await createMutation.mutate({ path: "/api/bookings", data });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to process request");
    }
  };

  return (
    <div className="space-y-6">
      <FormComponent
        fields={fields}
        defaultValue={{
          amount: 0,
          status: "pending",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={bookingSchema}
        onCancel={onCancel}
        isSubmitting={createMutation.isLoading}
        submitText="Create Booking"
        hideSectiontitle={true}
      />
    </div>
  );
}
