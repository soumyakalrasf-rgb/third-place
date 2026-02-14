import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";

export default function Onboarding() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div
        className="w-full max-w-md"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        <Card className="border-0 bg-card/60 overflow-visible">
          <CardContent className="pt-12 pb-10 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-3" data-testid="text-onboarding-title">
              Coming Soon
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We're crafting the onboarding experience to help you share
              what matters most. Check back soon.
            </p>
            <Link href="/">
              <Button variant="outline" className="group" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
