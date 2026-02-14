import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function Matching() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-pulse"
      >
        <Sparkles className="h-10 w-10 text-foreground/70" />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3" data-testid="text-matching-title">
        Finding Your People{dots}
      </h1>

      <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed mb-2" data-testid="text-matching-subtitle">
        Our AI is matching you with compatible people in your area and planning the perfect gathering.
      </p>

      <p className="text-sm text-muted-foreground/70 mb-10">
        This usually takes a moment.
      </p>

      <Link href="/">
        <Button variant="outline" data-testid="button-back-home">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
