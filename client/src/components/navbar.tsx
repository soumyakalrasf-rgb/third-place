import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";

const DEMO_PROFILE = {
  firstName: "Alex",
  age: 34,
  neighborhood: "Mission District, SF",
  genderIdentity: "Woman",
  genderSelfDescribe: "",
  pronouns: "She/her",
  pronounsOther: "",
  interestedIn: ["Men", "Women"],
  values: ["Authenticity", "Growth", "Creativity"],
  fridayNight: "Try a new restaurant",
  relationshipVision: "A partnership where we challenge and support each other equally",
  pastLesson: "I learned that compatibility in values matters more than chemistry alone",
  loveLanguage: "Quality Time",
  conflictStyle: "Need space first then talk",
  lookingFor: "A serious relationship",
  communicationStyle: "Warm and nurturing",
  nonNegotiables: ["Emotional availability", "Intellectual connection"],
  unexpectedThing: "I speak three languages and make pottery on weekends",
  dietaryPreferences: ["No restrictions"],
  readyToShowUp: true,
  communityAgreement: true,
  backgroundCheck: true,
  references: [
    { name: "Jordan Lee", email: "jordan@email.com", relationship: "Close friend" },
    { name: "Sam Rivera", email: "sam@email.com", relationship: "Colleague" },
  ],
};

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [location, navigate] = useLocation();
  const isLanding = location === "/";

  const demoMutation = useMutation<Profile, Error>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/profiles", DEMO_PROFILE);
      return res.json();
    },
    onSuccess: (profile) => {
      navigate(`/matching?id=${profile.id}`);
    },
  });

  const navClass = transparent && isLanding
    ? "fixed top-0 left-0 right-0 z-50"
    : "fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50";

  return (
    <nav className={navClass} data-testid="nav-main">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" data-testid="link-home">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground cursor-pointer">
            Third Place
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/community">
            <Button variant="ghost" size="sm" data-testid="button-nav-community">
              Community
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => demoMutation.mutate()}
            disabled={demoMutation.isPending}
            data-testid="button-try-demo"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            {demoMutation.isPending ? "Loading..." : "Try Demo"}
          </Button>
          {isLanding && (
            <Link href="/onboarding">
              <Button size="sm" data-testid="button-nav-cta">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
