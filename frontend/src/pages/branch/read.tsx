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
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  SquarePen, 
  Phone, 
  Mail, 
  Clock,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UpdateBranch from "./update";

export default function ReadBranch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const {
    data: branchData,
    isLoading,
    refetch,
  } = useFetch({
    path: `/api/branches/${id}`,
    queryKey: `branch-${id}`,
  });

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => navigate("/branches")}
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

  const branch = branchData?.branch;

  if (!branch) {
    return (
      <div className={pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-card border border-border rounded-2xl shadow-xl">
          <p className="text-xl font-bold text-muted-foreground">
            Branch not found
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate("/branches")}
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
            Branch Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed information about {branch.name}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        {/* Banner Section */}
        <div className="h-48 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 relative">
          {branch.imageUrl && (
            <img 
              src={branch.imageUrl} 
              alt={branch.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute top-6 right-8">
            <Button onClick={() => setIsUpdateOpen(true)}>
              <SquarePen className="w-4 h-4" />
              Edit Branch
            </Button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-10 pb-10">
          <div className="relative flex items-end gap-6 -mt-16 mb-8">
            <div className="w-32 h-32 rounded-full bg-emerald-600 border-4 border-card flex items-center justify-center text-white text-5xl font-bold shadow-xl overflow-hidden">
              {branch.imageUrl ? (
                <img src={branch.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                branch.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="pb-2">
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                {branch.name}
              </h2>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">
                  BRANCH
                </span>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                  branch.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {branch.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </div>
              <div className="space-y-1">
                <p className="text-foreground font-semibold text-lg">{branch.city}</p>
                <p className="text-muted-foreground leading-relaxed">{branch.address}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Phone className="w-3.5 h-3.5" />
                  Contact
                </div>
                <p className="text-foreground font-medium">{branch.phone || "No phone provided"}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </div>
                <p className="text-foreground font-medium">{branch.email || "No email provided"}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Clock className="w-3.5 h-3.5" />
                  Operating Hours
                </div>
                <p className="text-foreground font-medium">{branch.operatingHours || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                  <Calendar className="w-3.5 h-3.5" />
                  Created Date
                </div>
                <p className="text-foreground font-medium">
                  {branch.createdAt
                    ? new Date(branch.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              {branch.imageUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image Link
                  </div>
                  <a href={branch.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium text-sm flex items-center gap-1.5 w-fit">
                    View Image
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Update Branch</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {id && (
              <UpdateBranch
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
