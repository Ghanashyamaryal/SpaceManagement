import Loading from "@/components/common/Loading";
import { pageContainer } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { useFetch } from "@/hooks/queryFn";
import { ArrowLeft, BookOpen, Calendar, Clock, DollarSign, MapPin, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReadBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: bookingData,
    isLoading,
  } = useFetch({
    path: `/api/bookings/${id}`,
    queryKey: `booking-${id}`,
  });

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => navigate("/bookings")}
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

  const booking = bookingData?.booking;

  if (!booking) {
    return (
      <div className={pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-card border border-border rounded-2xl shadow-xl">
          <p className="text-xl font-bold text-muted-foreground">
            Booking not found
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
            Booking Details
          </h1>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Booking #{booking._id?.slice(-6)}</h2>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${
                booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' :
                booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                booking.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                'bg-red-50 text-red-600 border-red-200'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {booking.user?.name || booking.user || 'Unknown User'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-foreground">
                Workspace: {booking.workspace?.name || booking.workspace}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-foreground">
                Branch: {booking.branch?.name || booking.branch}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium text-foreground">
                Amount: ${booking.amount}
              </span>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Notes</p>
            <p className="text-md font-medium">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
