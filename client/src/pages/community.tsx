import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";

const UPCOMING_EVENTS = [
  {
    id: "evt-1",
    title: "Wine & Watercolors at Bluxome",
    type: "Creative Social",
    date: "Saturday, Feb 22",
    time: "6:30 PM",
    venue: "Bluxome Street Winery",
    neighborhood: "SoMa, SF",
    spotsTotal: 8,
    spotsTaken: 5,
    description: "Sip local wines while learning basic watercolor techniques. No experience needed — just curiosity and good company.",
  },
  {
    id: "evt-2",
    title: "Sunrise Hike & Coffee",
    type: "Outdoor Adventure",
    date: "Sunday, Feb 23",
    time: "7:00 AM",
    venue: "Lands End Trail",
    neighborhood: "Outer Richmond, SF",
    spotsTotal: 6,
    spotsTaken: 4,
    description: "A mellow morning hike with stunning ocean views, followed by pour-over coffee at a hidden gem nearby.",
  },
  {
    id: "evt-3",
    title: "Pasta Making & Conversation",
    type: "Culinary",
    date: "Friday, Feb 28",
    time: "7:00 PM",
    venue: "The Civic Kitchen",
    neighborhood: "Civic Center, SF",
    spotsTotal: 8,
    spotsTaken: 7,
    description: "Roll up your sleeves for handmade pasta. Share stories, share a meal — a warm Italian evening with new friends.",
  },
  {
    id: "evt-4",
    title: "Jazz Night at The Alley",
    type: "Live Music",
    date: "Saturday, Mar 1",
    time: "8:00 PM",
    venue: "The Alley Piano Bar",
    neighborhood: "Grand Lake, Oakland",
    spotsTotal: 6,
    spotsTaken: 2,
    description: "An intimate evening of live jazz, craft cocktails, and easy conversation in one of Oakland's best-kept secrets.",
  },
];

export default function Community() {
  const [waitlisted, setWaitlisted] = useState<Set<string>>(new Set());

  const toggleWaitlist = (id: string) => {
    setWaitlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
            <Calendar className="h-3.5 w-3.5" />
            <span>Upcoming Gatherings</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight" data-testid="text-community-title">
            Find Your Next Gathering
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" data-testid="text-community-subtitle">
            Browse curated events happening in your area. Every gathering is small, intentional, and designed for real connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="grid-events">
          {UPCOMING_EVENTS.map((event, idx) => {
            const spotsLeft = event.spotsTotal - event.spotsTaken;
            const isAlmostFull = spotsLeft <= 2;
            const joined = waitlisted.has(event.id);

            return (
              <Card key={event.id} className="overflow-visible" data-testid={`card-event-${idx}`}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="secondary" data-testid={`badge-event-type-${idx}`}>
                      {event.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={isAlmostFull ? "border-destructive/40 text-destructive" : ""}
                      data-testid={`badge-spots-${idx}`}
                    >
                      {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                    </Badge>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-foreground mb-2" data-testid={`text-event-title-${idx}`}>
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid={`text-event-desc-${idx}`}>
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.venue} &middot; {event.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.spotsTaken}/{event.spotsTotal} matched</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex -space-x-2">
                      {Array.from({ length: event.spotsTaken }).map((_, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-primary/15 border-2 border-background flex items-center justify-center text-[10px] font-bold text-foreground/60"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant={joined ? "outline" : "default"}
                      onClick={() => toggleWaitlist(event.id)}
                      data-testid={`button-waitlist-${idx}`}
                    >
                      {joined ? "On Waitlist" : "Join Waitlist"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Want a gathering curated just for you?</p>
          <Link href="/onboarding">
            <Button size="lg" data-testid="button-community-cta">
              Get Matched
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
