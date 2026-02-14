import { useEffect, useState, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const ROTATING_PHRASES = [
  "Analyzing compatibility...",
  "Building multiple gatherings for you...",
  "Matching you with different crews...",
  "Curating unique events...",
  "Finding your best options...",
  "Almost ready...",
];

interface MatchResult {
  gatherings: any[];
  recommendedGathering: number;
}

export default function Matching() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const profileId = params.get("id");
  const [, navigate] = useLocation();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const hasStarted = useRef(false);

  const matchMutation = useMutation<MatchResult, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", "/api/match", { profileId: id });
      return res.json();
    },
    onSuccess: (data) => {
      sessionStorage.setItem("matchResult", JSON.stringify(data));
      navigate("/results");
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (profileId && !hasStarted.current) {
      hasStarted.current = true;
      matchMutation.mutate(profileId);
    }
  }, [profileId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!profileId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
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

  if (matchMutation.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles className="h-12 w-12 text-foreground/60" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-matching-title">
        Finding Your People
      </h1>

      <div className="h-8 flex items-center justify-center mb-6" data-testid="text-rotating-phrase">
        <p
          key={phraseIndex}
          className="text-lg text-muted-foreground"
          style={{
            animation: "phraseIn 0.5s ease-out",
          }}
        >
          {ROTATING_PHRASES[phraseIndex]}
        </p>
      </div>

      <div className="flex gap-2 mb-8" data-testid="loading-dots">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary/40"
            style={{
              animation: "dotPulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground/60">
        This usually takes a few seconds.
      </p>

      <style>{`
        @keyframes phraseIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
