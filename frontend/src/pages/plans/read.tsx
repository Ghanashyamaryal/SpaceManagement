import Loading from "@/components/common/Loading";
import { pageContainer } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { useFetch } from "@/hooks/queryFn";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReadPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: planData,
    isLoading,
  } = useFetch({
    path: `/api/plans/${id}`,
    queryKey: `plan-${id}`,
  });

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => navigate("/plans")}
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

  const plan = planData?.plan;

  if (!plan) {
    return (
      <div className={pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-card border border-border rounded-2xl shadow-xl">
          <p className="text-xl font-bold text-muted-foreground">
            Plan not found
          </p>
          {backButton}
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
            Plan Details
          </h1>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full">
                {plan.type}
              </span>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${plan.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-medium">${plan.price}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration (Days)</p>
            <p className="text-lg font-medium">{plan.durationDays}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Max Bookings / Month</p>
            <p className="text-lg font-medium">{plan.maxBookingsPerMonth || 'Unlimited'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Meeting Room Hours</p>
            <p className="text-lg font-medium">{plan.meetingRoomHours}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
