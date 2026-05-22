import Loading from "@/components/common/Loading";
import { pageContainer } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { useFetch } from "@/hooks/queryFn";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReadEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: eventData,
    isLoading,
  } = useFetch({
    path: `/api/events/${id}`,
    queryKey: `event-${id}`,
  });

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => navigate("/events")}
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

  const event = eventData?.event;

  if (!event) {
    return (
      <div className={pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-card border border-border rounded-2xl shadow-xl">
          <p className="text-xl font-bold text-muted-foreground">
            Event not found
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
            Event Details
          </h1>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full">
                {event.event_type?.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase rounded-full border border-gray-200">
                {event.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-md font-medium mt-1">{event.description || 'No description provided.'}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'} {event.start_time && `at ${event.start_time}`} {event.end_time && `- ${event.end_time}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {event.branch_name || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {event.registered_count} / {event.capacity || 'Unlimited'} Attendees
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
