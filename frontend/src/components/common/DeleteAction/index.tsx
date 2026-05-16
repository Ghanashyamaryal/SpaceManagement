import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import { Button } from "@/components/ui/Button";
import { useMutation } from "@/hooks";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteActionProps {
  path: string;
  onSuccess?: () => void;
  confirmMessage?: string;
  className?: string;
  iconClassName?: string;
  title?: string;
}

export const DeleteAction = ({
  path,
  onSuccess,
  confirmMessage = "This action cannot be undone. This will permanently delete or remove data from our servers.",
  title = "Are you absolutely sure?",
  className = "h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50",
  iconClassName = "h-4 w-4",
}: DeleteActionProps) => {
  const deleteMutation = useMutation({
    path: "",
    method: "DELETE",
    onSuccess: () => {
      toast.success("Deleted successfully");
      if (onSuccess) onSuccess();
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const handleDelete = () => {
    deleteMutation.mutate({ path });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          disabled={deleteMutation.isLoading}
        >
          <Trash2 className={iconClassName} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-blue-600 border-blue-100 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
