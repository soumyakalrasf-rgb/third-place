import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, type ReactNode } from "react";
import Navbar from "@/components/navbar";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Matching from "@/pages/matching";
import Results from "@/pages/results";
import NotFound from "@/pages/not-found";

function PageTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [displayKey, setDisplayKey] = useState(location);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (location !== displayKey) {
      setVisible(false);
      const t = setTimeout(() => {
        setDisplayKey(location);
        setVisible(true);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [location, displayKey]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/matching" component={Matching} />
      <Route path="/results" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isLanding = location === "/";
  const showNavbar = location !== "/matching";

  return (
    <>
      {showNavbar && <Navbar transparent={isLanding} />}
      <PageTransition>
        <Router />
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
