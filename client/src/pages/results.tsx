import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MapPin, Clock, MessageCircle, Users, Calendar, Check } from "lucide-react";
import confetti from "canvas-confetti";

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

export default function Results() {
  const [, navigate] = useLocation();
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [rsvpd, setRsvpd] = useState(false);
  const [visible, setVisible] = useState(false);
  const confettiFired = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = sessionStorage.getItem("matchResult");
    if (stored) {
      try {
        setMatchResult(JSON.parse(stored));
      } catch {
        navigate("/onboarding");
      }
    } else {
      navigate("/onboarding");
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleRsvp = () => {
    setRsvpd(true);
    if (!confettiFired.current) {
      confettiFired.current = true;
      const duration = 2000;
      const end = Date.now() + duration;
      const colors = ["#C4704B", "#4A2040", "#7A8B6F", "#FFFAF5"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  };

  if (!matchResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles className="h-8 w-8 text-foreground/60" />
        </div>
      </div>
    );
  }

  const { group, event } = matchResult;

  return (
    <div
      className="min-h-screen bg-background transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">

        <section className="mb-14" data-testid="section-event">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5" />
              <span>Your Gathering</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight" data-testid="text-event-title">
              {event.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" data-testid="text-event-description">
              {event.description}
            </p>
          </div>

          <Card className="overflow-visible" data-testid="card-event-details">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-foreground/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground" data-testid="text-event-venue">{event.venue}</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-event-address">{event.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-foreground/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground" data-testid="text-event-date">{event.suggestedDate}</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-event-time">{event.suggestedTime}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground/80 italic mt-5 pt-5 border-t border-border" data-testid="text-event-why">
                {event.whyThisEvent}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-14" data-testid="section-group">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-foreground/60" />
            <h2 className="font-serif text-2xl font-bold text-foreground" data-testid="text-group-heading">Your Group</h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-x-visible sm:pb-0 sm:snap-none">
            {group.map((member, idx) => (
              <Card key={member.id} className="overflow-visible min-w-[280px] snap-start sm:min-w-0" data-testid={`card-match-${idx}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-sm font-bold text-foreground">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-foreground" data-testid={`text-match-name-${idx}`}>{member.name}</span>
                        <span className="text-sm text-muted-foreground">{member.age}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 shrink-0" />
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

        <section className="mb-14" data-testid="section-starters">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-foreground/60" />
            <h2 className="font-serif text-2xl font-bold text-foreground" data-testid="text-starters-heading">Conversation Starters</h2>
          </div>
          <Card className="overflow-visible bg-primary/5 border-primary/10" data-testid="card-starters">
            <CardContent className="p-6">
              <ul className="space-y-4">
                {event.conversationStarters.map((starter: string, i: number) => (
                  <li key={i} className="flex items-start gap-3" data-testid={`text-starter-${i}`}>
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-foreground mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-foreground leading-relaxed">{starter}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="text-center pb-8" data-testid="section-rsvp">
          {!rsvpd ? (
            <div>
              <Button
                size="lg"
                className="text-lg px-10"
                onClick={handleRsvp}
                data-testid="button-rsvp"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Count Me In!
              </Button>
              <div className="mt-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" data-testid="button-not-this-time">
                    Not This Time
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div
              className="py-8"
              style={{ animation: "rsvpFadeIn 0.6s ease-out" }}
              data-testid="rsvp-confirmation"
            >
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
                <Check className="h-8 w-8 text-foreground/70" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-rsvp-confirmed">
                You're in!
              </h3>
              <p className="text-muted-foreground text-lg inline-flex items-center gap-1.5 flex-wrap justify-center" data-testid="text-rsvp-message">
                We'll send you the details. See you Saturday!
                <Sparkles className="h-4 w-4 text-foreground/50 inline" />
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button variant="outline" data-testid="button-back-home">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes rsvpFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
