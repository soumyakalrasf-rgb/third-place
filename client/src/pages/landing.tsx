import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Sparkles, MessageCircleHeart, ArrowRight } from "lucide-react";

function useIntersectionObserver(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function FadeUp({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s, transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function HeroFade({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50" data-testid="nav-main">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" data-testid="link-home">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground cursor-pointer">
            Third Place
          </span>
        </Link>
        <Link href="/onboarding">
          <Button size="sm" data-testid="button-nav-cta">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <HeroFade delay={0}>
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-foreground text-sm font-medium tracking-wide" data-testid="text-hero-badge">
            A new way to meet people
          </span>
        </HeroFade>

        <HeroFade delay={0.1}>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] text-foreground" data-testid="text-hero-headline">
            Stop Swiping.
            <br />
            <span className="text-foreground/80">Start Gathering.</span>
          </h1>
        </HeroFade>

        <HeroFade delay={0.2}>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subheadline">
            Third Place matches you with a curated group of compatible people and
            plans the perfect outing. No awkward first dates — just real connections.
          </p>
        </HeroFade>

        <HeroFade delay={0.35}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding">
              <Button size="lg" className="text-base px-8" data-testid="button-hero-cta">
                Find Your Gathering
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </HeroFade>

        <HeroFade delay={0.55}>
          <p className="mt-4 text-sm text-muted-foreground/70" data-testid="text-hero-note">
            Free to join. Curated gatherings in your city.
          </p>
        </HeroFade>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: MessageCircleHeart,
      title: "Share What Matters",
      description: "Answer a few thoughtful questions about your values and lifestyle. No surface-level stuff — we dig into what actually matters.",
    },
    {
      number: "02",
      icon: Users,
      title: "We Find Your People",
      description: "Our AI clusters you with 4\u20136 compatible people in your area. Real compatibility, not just proximity.",
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Show Up & Connect",
      description: "Attend a curated micro-event designed around your group\u2019s shared interests. Low pressure, high potential.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative" data-testid="section-how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent/30 text-accent-foreground text-sm font-medium" data-testid="text-hiw-label">
            Simple & intentional
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground" data-testid="text-hiw-title">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto" data-testid="text-hiw-subtitle">
            Three steps to meaningful connections. No games, no algorithms optimizing for engagement.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.15}>
              <Card className="h-full border-0 bg-card/50 hover-elevate overflow-visible" data-testid={`card-step-${step.number}`}>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase" data-testid={`text-step-label-${step.number}`}>
                      Step {step.number}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-5">
                    <step.icon className="h-6 w-6 text-foreground/70" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-step-title-${step.number}`}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid={`text-step-desc-${step.number}`}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const values = [
    {
      icon: Heart,
      title: "Built for Serious Connection",
      description: "No swiping, no ghosting, just intentional gatherings with people who are ready for something real.",
    },
    {
      icon: Users,
      title: "Group First, Less Pressure",
      description: "Meet 4\u20136 people at once in a relaxed setting. Let chemistry happen naturally without the spotlight of a 1:1 date.",
    },
    {
      icon: Sparkles,
      title: "AI That Gets You",
      description: "Matched on values, lifestyle, and what actually matters for long-term compatibility \u2014 not just a photo and a bio.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative" data-testid="section-why">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 text-foreground text-sm font-medium" data-testid="text-why-label">
            Why us
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground" data-testid="text-why-title">
            Why Third Place?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto" data-testid="text-why-subtitle">
            We're building the dating experience we wished existed.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <FadeUp key={value.title} delay={i * 0.15}>
              <div className="text-center p-8" data-testid={`card-value-${i}`}>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-7 w-7 text-foreground/70" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-value-title-${i}`}>
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed" data-testid={`text-value-desc-${i}`}>
                  {value.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-16 text-center" delay={0.3}>
          <Link href="/onboarding">
            <Button size="lg" className="text-base px-8" data-testid="button-why-cta">
              Find Your Gathering
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 sm:py-32" data-testid="section-cta">
      <div className="max-w-4xl mx-auto px-6">
        <FadeUp>
          <Card className="border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 overflow-visible">
            <CardContent className="py-16 px-8 sm:px-16 text-center">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4" data-testid="text-cta-title">
                Ready for Something Real?
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8 leading-relaxed" data-testid="text-cta-subtitle">
                Join a community of people who believe the best connections happen in
                person, in groups, over shared experiences.
              </p>
              <Link href="/onboarding">
                <Button size="lg" className="text-base px-8" data-testid="button-cta-bottom">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-border/50" data-testid="section-footer">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4">
          <span className="font-serif text-lg font-semibold text-foreground" data-testid="text-footer-brand">
            Third Place
          </span>
          <p className="text-sm text-muted-foreground" data-testid="text-footer-tagline">
            Built with <Heart className="inline h-3.5 w-3.5 text-destructive fill-destructive mx-0.5 -mt-0.5" /> at the Build What You Love Hackathon
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2" data-testid="text-footer-copyright">
            &copy; {new Date().getFullYear()} Third Place. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <WhySection />
      <CTASection />
      <Footer />
    </div>
  );
}
