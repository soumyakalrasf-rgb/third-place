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

const FALLBACK_MATCH: MatchResult = {
  gatherings: [
    {
      group: [
        { id: "seed-maya", name: "Maya", age: 34, neighborhood: "Mission District, SF", matchReason: "Maya shares your love of ceramics and deep conversation. Her warmth and creativity make her a natural match for your authentic energy." },
        { id: "seed-james", name: "James", age: 38, neighborhood: "Hayes Valley, SF", matchReason: "James brings humor and emotional depth in equal measure. His focus on building a real partnership aligns perfectly with your values." },
        { id: "seed-elena", name: "Elena", age: 37, neighborhood: "North Beach, SF", matchReason: "Elena's creative spirit and direct communication style complement your warmth. You both value authenticity above all else." },
        { id: "seed-theo", name: "Theo", age: 37, neighborhood: "Lower Haight, SF", matchReason: "Theo's thoughtful nature and mindful approach to relationships mirror your own journey of self-discovery and growth." },
      ],
      event: {
        title: "Candlelit Supper & Soul Talk",
        type: "dinner",
        description: "An intimate farm-to-table dinner at a cozy Mission District restaurant. Each course is paired with a thoughtful conversation prompt designed to move past small talk and into the stories that matter.",
        venue: "Foreign Cinema",
        address: "2534 Mission St, San Francisco, CA 94110",
        suggestedDate: "This Saturday",
        suggestedTime: "7:00 PM",
        conversationStarters: [
          "What's a belief you held strongly at 25 that you've completely let go of?",
          "Describe a moment this year where you felt truly seen by someone.",
          "If you could have dinner with anyone in history, who and why?",
        ],
        whyThisEvent: "This group thrives on authentic connection and deep conversation. A beautifully set table with candlelight creates the perfect setting for the kind of vulnerable, meaningful exchange this crew craves.",
      },
      compatibilityScore: 95,
    },
    {
      group: [
        { id: "seed-marcus", name: "Marcus", age: 40, neighborhood: "Bernal Heights, SF", matchReason: "Marcus is an adventurer at heart who's learning to let people in. His playful energy and love of the outdoors match your sense of curiosity." },
        { id: "seed-nina", name: "Nina", age: 35, neighborhood: "Lake Merritt, Oakland", matchReason: "Nina's adventurous spirit and direct communication style create an instant connection. She values intentional effort in relationships, just like you." },
        { id: "seed-jordan", name: "Jordan", age: 30, neighborhood: "Pacific Heights, SF", matchReason: "Jordan pushes people toward their best selves while staying grounded. Their ambition and thoughtful nature complement your growth mindset." },
        { id: "seed-priya", name: "Priya", age: 31, neighborhood: "Downtown Oakland", matchReason: "Priya's boldness and vulnerability make her magnetic. She left a stable career to follow her values — you both understand what it means to bet on yourself." },
      ],
      event: {
        title: "Golden Hour Trail & Coffee",
        type: "adventure",
        description: "A scenic sunset hike along the Lands End coastal trail with panoramic views of the Golden Gate Bridge. We'll finish at a hidden overlook with artisanal coffee and pastries as the fog rolls in.",
        venue: "Lands End Trailhead",
        address: "680 Point Lobos Ave, San Francisco, CA 94121",
        suggestedDate: "This Sunday",
        suggestedTime: "4:30 PM",
        conversationStarters: [
          "What's the most spontaneous thing you've done in the last year?",
          "If you could wake up tomorrow with one new skill fully mastered, what would it be?",
          "What does adventure mean to you at this stage of life?",
        ],
        whyThisEvent: "This crew is all about forward motion and new experiences. The combination of physical activity, stunning scenery, and fresh air naturally lowers walls and sparks genuine connection.",
      },
      compatibilityScore: 89,
    },
    {
      group: [
        { id: "seed-sam", name: "Sam", age: 35, neighborhood: "SoMa, SF", matchReason: "Sam is a secret creative with serious ambition. Their graphic novel project and love of surprises echo your multilingual, pottery-making spirit." },
        { id: "seed-olivia", name: "Olivia", age: 32, neighborhood: "Cole Valley, SF", matchReason: "Olivia brings laughter and warmth everywhere she goes. Her improv background means she's incredible at making everyone feel at ease." },
        { id: "seed-lena", name: "Lena", age: 29, neighborhood: "Dogpatch, SF", matchReason: "Lena's independence and creative energy are infectious. She built a tiny house with her own hands — you both know the joy of making something from nothing." },
        { id: "seed-aisha", name: "Aisha", age: 33, neighborhood: "Temescal, Oakland", matchReason: "Aisha's storytelling talent and spiritual depth bring a unique warmth. Her monthly storytelling nights show a gift for creating spaces where people open up." },
      ],
      event: {
        title: "Hands & Hearts Pottery Night",
        type: "workshop",
        description: "A guided pottery workshop in a sun-filled Valencia Street studio. You'll learn to throw on the wheel while sharing stories and laughter — there's something about working with clay that makes people beautifully vulnerable.",
        venue: "Clay by the Bay Studio",
        address: "1499 Valencia St, San Francisco, CA 94110",
        suggestedDate: "Next Wednesday",
        suggestedTime: "6:30 PM",
        conversationStarters: [
          "When was the last time you created something with your hands and felt proud?",
          "What's a hobby or passion that most people don't know about you?",
          "If you could collaborate on any creative project with anyone here, what would you make?",
        ],
        whyThisEvent: "This group is packed with creative energy and hidden talents. Getting messy with clay together creates natural moments of laughter and vulnerability — the perfect recipe for real connection.",
      },
      compatibilityScore: 86,
    },
  ],
  recommendedGathering: 0,
};

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
    onError: () => {
      sessionStorage.setItem("matchResult", JSON.stringify(FALLBACK_MATCH));
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
