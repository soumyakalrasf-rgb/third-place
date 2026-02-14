import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, MapPin, Clock, MessageCircle, Users, Calendar, Check, Share2, Cpu, ShieldCheck, UserCheck, Copy, Flag, Star, ChevronLeft, ChevronRight } from "lucide-react";
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

interface Gathering {
  group: MatchMember[];
  event: MatchEvent;
  compatibilityScore: number;
}

interface MatchResult {
  gatherings: Gathering[];
  recommendedGathering: number;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  dinner: "Curated Dinner",
  adventure: "Adventure Outing",
  workshop: "Creative Workshop",
  cultural: "Cultural Night",
  game: "Game & Social",
  brunch: "Sunday Brunch",
  ideas: "Book & Ideas",
  wellness: "Wellness Experience",
};

export default function Results() {
  const [, navigate] = useLocation();
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [rsvpMap, setRsvpMap] = useState<Record<number, boolean>>({});
  const [visible, setVisible] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [safetyCopied, setSafetyCopied] = useState(false);
  const confettiFired = useRef<Record<number, boolean>>({});
  const chimePlayed = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = sessionStorage.getItem("matchResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.gatherings) {
          setMatchResult(parsed);
          setActiveTab(parsed.recommendedGathering || 0);
        } else if (parsed.group && parsed.event) {
          setMatchResult({
            gatherings: [{ group: parsed.group, event: parsed.event, compatibilityScore: 92 }],
            recommendedGathering: 0,
          });
          setActiveTab(0);
        } else {
          navigate("/onboarding");
        }
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

  const handleRsvp = (idx: number) => {
    setRsvpMap((prev) => ({ ...prev, [idx]: true }));
    if (!confettiFired.current[idx]) {
      confettiFired.current[idx] = true;
      const duration = 2000;
      const end = Date.now() + duration;
      const colors = ["#C4704B", "#4A2040", "#7A8B6F", "#FFFAF5"];
      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  };

  const handleCopyShare = async () => {
    if (!matchResult) return;
    const g = matchResult.gatherings[activeTab];
    const text = `I'm going to "${g.event.title}" with Third Place! Want to join the next one? Check it out: thirdplace.app`;
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
    const g = matchResult.gatherings[activeTab];
    const text = `Hey! I'm going to a Third Place gathering this weekend. Here are the details:\n\nEvent: ${g.event.title}\nVenue: ${g.event.venue}\nAddress: ${g.event.address}\nDate: ${g.event.suggestedDate}\nTime: ${g.event.suggestedTime}\n\nJust sharing so you know where I'll be!`;
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

  const { gatherings, recommendedGathering } = matchResult;
  const current = gatherings[activeTab];
  if (!current) return null;
  const { group, event, compatibilityScore } = current;
  const isRsvpd = rsvpMap[activeTab] || false;

  return (
    <div
      className="min-h-screen transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 sm:py-16">

        <div className="flex justify-center mb-6" data-testid="badge-ai-powered">
          <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-muted-foreground">
            <Cpu className="h-3 w-3" />
            AI-Powered Matching
          </Badge>
        </div>

        {gatherings.length > 1 && (
          <div className="mb-10">
            <p className="text-center text-sm text-muted-foreground mb-4">
              We found {gatherings.length} gatherings for you. Browse your options:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2" data-testid="gathering-tabs">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                disabled={activeTab === 0}
                data-testid="button-prev-gathering"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {gatherings.map((g, idx) => (
                <Button
                  key={idx}
                  variant={activeTab === idx ? "default" : "outline"}
                  onClick={() => setActiveTab(idx)}
                  data-testid={`tab-gathering-${idx}`}
                  className="flex flex-col items-start"
                >
                  <span className="flex items-center gap-1.5">
                    {idx === recommendedGathering && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    )}
                    {EVENT_TYPE_LABELS[g.event.type] || g.event.type}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {g.compatibilityScore}% match
                  </span>
                </Button>
              ))}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab((prev) => Math.min(gatherings.length - 1, prev + 1))}
                disabled={activeTab === gatherings.length - 1}
                data-testid="button-next-gathering"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div key={activeTab} style={{ animation: "gatheringFadeIn 0.4s ease-out" }}>

          <section className="mb-14" data-testid="section-event">
            <div className="text-center mb-10">
              <div className="inline-flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4 justify-center">
                <Calendar className="h-3.5 w-3.5" />
                <span>Gathering {activeTab + 1} of {gatherings.length}</span>
                {activeTab === recommendedGathering && (
                  <Badge variant="outline" className="gap-1 text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 no-default-hover-elevate no-default-active-elevate" data-testid="badge-best-match">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    Best Match
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight" data-testid="text-event-title">
                {event.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed" data-testid="text-event-description">
                {event.description}
              </p>
              <div className="mt-3 inline-flex items-center gap-2">
                <Badge variant="secondary" className="text-xs no-default-hover-elevate no-default-active-elevate" data-testid="badge-event-type">
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </Badge>
                <Badge variant="outline" className="text-xs no-default-hover-elevate no-default-active-elevate" data-testid="badge-compatibility">
                  {compatibilityScore}% compatible
                </Badge>
              </div>
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
            {!isRsvpd ? (
              <div>
                <Button
                  size="lg"
                  onClick={() => handleRsvp(activeTab)}
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
                  We'll send you the details for "{event.title}"
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
        @keyframes gatheringFadeIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
