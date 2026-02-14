import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowLeft, MapPin, Calendar, Clock, MessageCircle, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MatchMember {
  id: string;
  name: string;
  age: number;
  neighborhood: string;
  matchReason: string;
}

interface MatchEvent {
  title: string;
  type: string;
  description: string;
  venue: string;
  address: string;
  suggestedDate: string;
  suggestedTime: string;
  conversationStarters: string[];
  whyThisEvent: string;
}

interface MatchResult {
  group: MatchMember[];
  event: MatchEvent;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-pulse">
        <Sparkles className="h-10 w-10 text-foreground/70" />
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3" data-testid="text-matching-title">
        Finding Your People...
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed mb-2" data-testid="text-matching-subtitle">
        Our AI is matching you with compatible people in your area and planning the perfect gathering.
      </p>
      <p className="text-sm text-muted-foreground/70 mb-10">
        This usually takes a moment.
      </p>
    </div>
  );
}

export default function Matching() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const profileId = params.get("id");

  const matchMutation = useMutation<MatchResult, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", "/api/match", { profileId: id });
      return res.json();
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (profileId && !matchMutation.data && !matchMutation.isPending) {
      matchMutation.mutate(profileId);
    }
  }, [profileId]);

  if (!profileId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-4" data-testid="text-matching-title">
          No Profile Found
        </h1>
        <p className="text-muted-foreground mb-8">Complete the onboarding first to find your group.</p>
        <Link href="/onboarding">
          <Button data-testid="button-go-onboarding">Start Onboarding</Button>
        </Link>
      </div>
    );
  }

  if (matchMutation.isPending || (!matchMutation.data && !matchMutation.isError)) {
    return <LoadingState />;
  }

  if (matchMutation.isError || !matchMutation.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-4" data-testid="text-matching-title">
          Something Went Wrong
        </h1>
        <p className="text-muted-foreground mb-8">We couldn't find your matches. Please try again.</p>
        <Link href="/onboarding">
          <Button data-testid="button-retry">Try Again</Button>
        </Link>
      </div>
    );
  }

  const { group, event } = matchMutation.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-foreground/70" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3" data-testid="text-matching-title">
            Your Group is Ready
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto" data-testid="text-matching-subtitle">
            We found {group.length} people who complement you beautifully.
          </p>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-foreground/70" />
            <h2 className="font-serif text-2xl font-bold text-foreground" data-testid="text-group-heading">Your Group</h2>
          </div>
          <div className="space-y-4">
            {group.map((member, idx) => (
              <Card key={member.id} className="overflow-visible" data-testid={`card-match-${idx}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-sm font-semibold text-foreground">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground" data-testid={`text-match-name-${idx}`}>{member.name}</span>
                        <span className="text-sm text-muted-foreground">{member.age}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{member.neighborhood}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-match-reason-${idx}`}>
                        {member.matchReason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-foreground/70" />
            <h2 className="font-serif text-2xl font-bold text-foreground" data-testid="text-event-heading">Your Gathering</h2>
          </div>
          <Card className="overflow-visible" data-testid="card-event">
            <CardContent className="p-6">
              <h3 className="font-serif text-xl font-bold text-foreground mb-1" data-testid="text-event-title">{event.title}</h3>
              <span className="inline-block text-xs uppercase tracking-wider text-muted-foreground mb-4">{event.type}</span>
              <p className="text-muted-foreground leading-relaxed mb-6" data-testid="text-event-description">{event.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-foreground/70 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid="text-event-venue">{event.venue}</p>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-foreground/70 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid="text-event-date">{event.suggestedDate}</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-event-time">{event.suggestedTime}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-4 w-4 text-foreground/70" />
                  <span className="text-sm font-medium text-foreground">Conversation Starters</span>
                </div>
                <ul className="space-y-2">
                  {event.conversationStarters.map((starter, i) => (
                    <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20" data-testid={`text-starter-${i}`}>
                      {starter}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground/80 italic" data-testid="text-event-why">{event.whyThisEvent}</p>
            </CardContent>
          </Card>
        </section>

        <div className="text-center space-y-4">
          <Button size="lg" data-testid="button-rsvp">
            <Sparkles className="mr-2 h-4 w-4" />
            Count Me In
          </Button>
          <div>
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
