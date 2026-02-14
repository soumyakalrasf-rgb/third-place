import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, MapPin, Clock, MessageCircle, Users, Calendar, Check, Share2, Cpu, ShieldCheck, UserCheck, Copy, Flag } from "lucide-react";
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
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [safetyCopied, setSafetyCopied] = useState(false);
  const confettiFired = useRef(false);
  const chimePlayed = useRef(false);

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

  useEffect(() => {
    if (visible && matchResult && !chimePlayed.current) {
      chimePlayed.current = true;
      try {
        const audio = new Audio("/chime.wav");
        audio.volume = 0.35;
        audio.play().catch(() => {});
      } catch {}
    }
  }, [visible, matchResult]);

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

  const handleCopyShare = async () => {
    if (!matchResult) return;
    const text = `I'm going to "${matchResult.event.title}" with Third Place! Want to join the next one? Check it out: thirdplace.app`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShareSafety = async () => {
    if (!matchResult) return;
    const text = `Hey! I'm going to a Third Place gathering this weekend. Here are the details:\n\nEvent: ${matchResult.event.title}\nVenue: ${matchResult.event.venue}\nAddress: ${matchResult.event.address}\nDate: ${matchResult.event.suggestedDate}\nTime: ${matchResult.event.suggestedTime}\n\nJust sharing so you know where I'll be!`;
    try {
      await navigator.clipboard.writeText(text);
      setSafetyCopied(true);
      setTimeout(() => setSafetyCopied(false), 2000);
    } catch {
      setSafetyCopied(false);
    }
  };

  if (!matchResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles className="h-8 w-8 text-foreground/60" />
        </div>
      </div>
    );
  }

  const { group, event } = matchResult;

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 sm:py-16">

        <div className="flex justify-center mb-8" data-testid="badge-ai-powered">
          <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-muted-foreground">
            <Cpu className="h-3 w-3" />
            AI-Powered Matching
          </Badge>
        </div>

        <section className="mb-14" data-testid="section-event">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5" />
              <span>Your Gathering</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight" data-testid="text-event-title">
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
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{member.neighborhood}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge variant="outline" className="text-[10px] gap-1 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 no-default-hover-elevate no-default-active-elevate" data-testid={`badge-verified-${idx}`}>
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Background Verified
                        </Badge>
                        <Badge variant="outline" className="text-[10px] gap-1 bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30 no-default-hover-elevate no-default-active-elevate" data-testid={`badge-references-${idx}`}>
                          <UserCheck className="h-2.5 w-2.5" />
                          References Checked
                        </Badge>
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

        <section className="mb-14" data-testid="section-safety">
          <Card className="overflow-visible border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-foreground/60" />
                <h3 className="font-serif text-lg font-bold text-foreground" data-testid="text-safety-heading">Safety</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={handleShareSafety} data-testid="button-share-safety">
                    {safetyCopied ? (
                      <>
                        <Check className="mr-2 h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Share gathering details with a friend
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open("mailto:safety@thirdplace.app?subject=Safety Concern", "_blank")} data-testid="button-report-concern">
                    <Flag className="mr-2 h-3.5 w-3.5" />
                    Report a concern
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-safety-host-note">
                  All gatherings are in public venues. A Third Place community host will be present at every event.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center pb-8" data-testid="section-rsvp">
          {!rsvpd ? (
            <div>
              <Button
                size="lg"
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
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={() => setShowShareCard(true)} data-testid="button-share">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share with a Friend
                </Button>
                <Link href="/">
                  <Button variant="ghost" data-testid="button-back-home">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog open={showShareCard} onOpenChange={setShowShareCard}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden" data-testid="modal-share">
          <div className="sr-only">
            <DialogHeader>
              <DialogTitle>Share your gathering</DialogTitle>
              <DialogDescription>Share this event with a friend</DialogDescription>
            </DialogHeader>
          </div>

          <div data-testid="share-card-preview">
            <div className="bg-gradient-to-br from-[#4A2040] via-[#6B3A5D] to-[#C4704B] p-8 text-center">
              <div className="mb-6">
                <span className="font-serif text-2xl font-bold text-white/95">
                  Third Place
                </span>
              </div>
              <p className="text-white/90 text-lg leading-relaxed mb-2">
                I'm going to
              </p>
              <p className="font-serif text-2xl font-bold text-white mb-4 leading-tight">
                "{event.title}"
              </p>
              <p className="text-white/80 text-sm mb-6">
                with Third Place
              </p>
              <div className="inline-block bg-white/15 backdrop-blur-sm rounded-md px-5 py-2.5">
                <p className="text-white font-medium text-sm">
                  Want to join the next one?
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 flex justify-center">
            <Button
              variant="outline"
              onClick={handleCopyShare}
              data-testid="button-copy-share"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy Share Text
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes rsvpFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
