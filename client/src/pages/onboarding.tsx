import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";
import {
  VALUES_OPTIONS,
  FRIDAY_NIGHT_OPTIONS,
  LOOKING_FOR_OPTIONS,
  COMMUNICATION_STYLE_OPTIONS,
  NON_NEGOTIABLES_OPTIONS,
  DIETARY_OPTIONS,
} from "@shared/schema";

interface FormData {
  firstName: string;
  age: string;
  neighborhood: string;
  values: string[];
  fridayNight: string;
  lookingFor: string;
  communicationStyle: string;
  nonNegotiables: string[];
  unexpectedThing: string;
  dietaryPreferences: string[];
  readyToShowUp: boolean;
}

const INITIAL_FORM: FormData = {
  firstName: "",
  age: "",
  neighborhood: "",
  values: [],
  fridayNight: "",
  lookingFor: "",
  communicationStyle: "",
  nonNegotiables: [],
  unexpectedThing: "",
  dietaryPreferences: [],
  readyToShowUp: false,
};

function StepWrapper({ children, visible }: { children: ReactNode; visible: boolean }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(24px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        position: visible ? "relative" : "absolute",
        pointerEvents: visible ? "auto" : "none",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
  disabled,
  testId,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      data-testid={testId}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-colors border cursor-pointer
        ${selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border"
        }
        ${disabled && !selected ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {label}
    </button>
  );
}

function RadioOption({
  label,
  selected,
  onClick,
  testId,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`
        w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors border cursor-pointer
        ${selected
          ? "bg-primary/10 text-foreground border-primary/40"
          : "bg-card/50 text-foreground border-border"
        }
      `}
    >
      {label}
    </button>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-muted-foreground font-medium" data-testid="text-step-indicator">
          Step {step + 1} of {total}
        </span>
        <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const totalSteps = 4;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: "values" | "nonNegotiables" | "dietaryPreferences", item: string, max?: number) => {
    setForm((prev) => {
      const arr = prev[key];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter((v) => v !== item) };
      }
      if (max && arr.length >= max) return prev;
      return { ...prev, [key]: [...arr, item] };
    });
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 0:
        return form.firstName.trim().length > 0 && Number(form.age) >= 25 && form.neighborhood.trim().length > 0;
      case 1:
        return form.values.length >= 1 && form.values.length <= 3 && form.fridayNight.length > 0;
      case 2:
        return form.lookingFor.length > 0 && form.communicationStyle.length > 0 && form.nonNegotiables.length >= 1 && form.nonNegotiables.length <= 2;
      case 3:
        return form.unexpectedThing.trim().length > 0 && form.dietaryPreferences.length >= 1 && form.readyToShowUp;
      default:
        return false;
    }
  };

  const submitMutation = useMutation<Profile, Error, typeof form>({
    mutationFn: async (data) => {
      const payload = { ...data, age: Number(data.age) };
      const res = await apiRequest("POST", "/api/profiles", payload);
      return await res.json();
    },
    onSuccess: (profile) => {
      navigate(`/matching?id=${profile.id}`);
    },
    onError: (e) => {
      toast({
        title: "Something went wrong",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!canContinue()) return;
    submitMutation.mutate(form);
  };

  const next = () => {
    if (step < totalSteps - 1 && canContinue()) setStep(step + 1);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-8 sm:py-24">
      <div className="w-full max-w-lg">
        <ProgressBar step={step} total={totalSteps} />

        <Card className="border-0 bg-card/60 overflow-visible">
          <CardContent className="pt-8 pb-8 px-5 sm:px-8 relative">
            <StepWrapper visible={step === 0}>
              <Step1 form={form} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 1}>
              <Step2 form={form} toggleArrayItem={toggleArrayItem} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 2}>
              <Step3 form={form} toggleArrayItem={toggleArrayItem} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 3}>
              <Step4 form={form} toggleArrayItem={toggleArrayItem} updateField={updateField} />
            </StepWrapper>

            <div className="flex items-center justify-between gap-4 mt-8 flex-wrap">
              {step > 0 ? (
                <Button variant="outline" onClick={back} data-testid="button-back">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step < totalSteps - 1 ? (
                <Button onClick={next} disabled={!canContinue()} data-testid="button-continue">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canContinue() || submitMutation.isPending} data-testid="button-submit">
                  {submitMutation.isPending ? "Submitting..." : "Find My Gathering"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step1({ form, updateField }: { form: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-step-title">
        Let's Start With You
      </h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed" data-testid="text-step-intro">
        We ask a few questions to find your people. No right answers — just be you.
      </p>

      <div className="space-y-5">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
          <Input
            id="firstName"
            placeholder="Your first name"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            data-testid="input-first-name"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="age" className="text-sm font-medium">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="25+"
            min={25}
            value={form.age}
            onChange={(e) => updateField("age", e.target.value)}
            data-testid="input-age"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="neighborhood" className="text-sm font-medium">Neighborhood / Area</Label>
          <Input
            id="neighborhood"
            placeholder="e.g. Mission District, SF"
            value={form.neighborhood}
            onChange={(e) => updateField("neighborhood", e.target.value)}
            data-testid="input-neighborhood"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({
  form,
  toggleArrayItem,
  updateField,
}: {
  form: FormData;
  toggleArrayItem: (key: "values" | "nonNegotiables" | "dietaryPreferences", item: string, max?: number) => void;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-step-title">
        What Matters Most To You?
      </h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Help us understand who you really are.
      </p>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Pick your top 3 values</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Select up to 3</p>
          <div className="flex flex-wrap gap-2">
            {VALUES_OPTIONS.map((v) => (
              <Chip
                key={v}
                label={v}
                selected={form.values.includes(v)}
                onClick={() => toggleArrayItem("values", v, 3)}
                disabled={form.values.length >= 3}
                testId={`chip-value-${v.toLowerCase()}`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">On a Friday night, you'd rather...</Label>
          <div className="space-y-2 mt-3">
            {FRIDAY_NIGHT_OPTIONS.map((opt) => (
              <RadioOption
                key={opt}
                label={opt}
                selected={form.fridayNight === opt}
                onClick={() => updateField("fridayNight", opt)}
                testId={`radio-friday-${opt.slice(0, 10).toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3({
  form,
  toggleArrayItem,
  updateField,
}: {
  form: FormData;
  toggleArrayItem: (key: "values" | "nonNegotiables" | "dietaryPreferences", item: string, max?: number) => void;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-step-title">
        Your Relationship Intentions
      </h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Let's find people on the same page as you.
      </p>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium">What are you looking for?</Label>
          <div className="space-y-2 mt-3">
            {LOOKING_FOR_OPTIONS.map((opt) => (
              <RadioOption
                key={opt}
                label={opt}
                selected={form.lookingFor === opt}
                onClick={() => updateField("lookingFor", opt)}
                testId={`radio-looking-${opt.slice(0, 10).toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">What's your communication style?</Label>
          <div className="space-y-2 mt-3">
            {COMMUNICATION_STYLE_OPTIONS.map((opt) => (
              <RadioOption
                key={opt}
                label={opt}
                selected={form.communicationStyle === opt}
                onClick={() => updateField("communicationStyle", opt)}
                testId={`radio-comm-${opt.slice(0, 10).toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Pick 2 non-negotiables</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Select up to 2</p>
          <div className="flex flex-wrap gap-2">
            {NON_NEGOTIABLES_OPTIONS.map((v) => (
              <Chip
                key={v}
                label={v}
                selected={form.nonNegotiables.includes(v)}
                onClick={() => toggleArrayItem("nonNegotiables", v, 2)}
                disabled={form.nonNegotiables.length >= 2}
                testId={`chip-nonneg-${v.slice(0, 10).toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4({
  form,
  toggleArrayItem,
  updateField,
}: {
  form: FormData;
  toggleArrayItem: (key: "values" | "nonNegotiables" | "dietaryPreferences", item: string, max?: number) => void;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-step-title">
        Almost There!
      </h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Just a few more things to make your profile shine.
      </p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="unexpected" className="text-sm font-medium">One thing people don't expect about you:</Label>
          <Textarea
            id="unexpected"
            placeholder="I once taught salsa to a group of grandmas..."
            value={form.unexpectedThing}
            onChange={(e) => updateField("unexpectedThing", e.target.value)}
            data-testid="input-unexpected"
            className="mt-1.5 resize-none"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Any dietary preferences for event planning?</Label>
          <div className="flex flex-wrap gap-2 mt-3">
            {DIETARY_OPTIONS.map((v) => (
              <Chip
                key={v}
                label={v}
                selected={form.dietaryPreferences.includes(v)}
                onClick={() => toggleArrayItem("dietaryPreferences", v)}
                testId={`chip-diet-${v.toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id="ready"
            checked={form.readyToShowUp}
            onCheckedChange={(checked) => updateField("readyToShowUp", checked === true)}
            data-testid="checkbox-ready"
          />
          <Label htmlFor="ready" className="text-sm leading-relaxed cursor-pointer">
            I'm ready to show up as my authentic self
          </Label>
        </div>
      </div>
    </div>
  );
}
