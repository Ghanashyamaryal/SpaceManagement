import Loading from "@/components/common/Loading";
import { pageContainer } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useFetch } from "@/hooks/queryFn";
import { ArrowLeft, Calendar, FileText, SquarePen, Building2, Users, Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UpdateWorkspace from "./update";

export default function ReadWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const {
    data: workspaceData,
    isLoading,
    refetch,
  } = useFetch({
    path: `/api/workspaces/${id}`,
    queryKey: `workspace-${id}`,
    // enabled: !!id,
  });

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => navigate("/manage-space")}
      className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors -ml-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );

  if (isLoading) {
    return (
      <div className={pageContainer}>
        <Loading className="min-h-[400px]" />
      </div>
    );
  }

  const workspace = workspaceData?.workspace;

  if (!workspace) {
    return (
      <div className={pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-card border border-border rounded-2xl shadow-xl">
          <p className="text-xl font-bold text-muted-foreground">
            Workspace not found
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate("/manage-space")}
            className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageContainer + " p-6"}>
      <div className="mb-6">
        {backButton}
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Workspace Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            View detailed information about the workspace unit
          </p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        {/* Banner Section */}
        <div className="h-48 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 relative">
          {workspace.imageUrl && (
            <img 
              src={workspace.imageUrl} 
              alt={workspace.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute top-6 right-8">
            <Button onClick={() => setIsUpdateOpen(true)}>
              <SquarePen className="w-4 h-4" />
              Edit Workspace
            </Button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-10 pb-10">
          <div className="relative flex items-end gap-6 -mt-16 mb-8">
            <div className="w-32 h-32 rounded-full bg-primary border-4 border-card flex items-center justify-center text-primary-foreground text-5xl font-bold shadow-xl overflow-hidden">
              {workspace.imageUrl ? (
                <img src={workspace.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                workspace.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="pb-2">
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                {workspace.name}
              </h2>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">
                  {workspace.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                  workspace.status === 'available' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {workspace.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                <FileText className="w-3.5 h-3.5" />
                Description
              </div>
              <p className="text-foreground font-medium leading-relaxed">
                {workspace.description || "No description provided for this workspace."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Building2 className="w-3.5 h-3.5" />
                  Branch
                </div>
                <p className="text-foreground font-medium">{workspace.branch?.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Layers className="w-3.5 h-3.5" />
                  Floor
                </div>
                <p className="text-foreground font-medium">{workspace.floor || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Users className="w-3.5 h-3.5" />
                  Capacity
                </div>
                <p className="text-foreground font-medium">{workspace.capacity} Persons</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Calendar className="w-3.5 h-3.5" />
                  Created Date
                </div>
                <p className="text-foreground font-medium">
                  {workspace.createdAt
                    ? new Date(workspace.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Update Workspace</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {id && (
              <UpdateWorkspace
                id={id}
                onSuccess={() => {
                  setIsUpdateOpen(false);
                  refetch();
                }}
                onCancel={() => setIsUpdateOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
