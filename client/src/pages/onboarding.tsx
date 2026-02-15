import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Sparkles, Shield, ShieldCheck, Loader2, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";
import { SiLinkedin, SiInstagram, SiSpotify } from "react-icons/si";
import {
  GENDER_IDENTITY_OPTIONS,
  PRONOUNS_OPTIONS,
  INTERESTED_IN_OPTIONS,
  VALUES_OPTIONS,
  FRIDAY_NIGHT_OPTIONS,
  LOVE_LANGUAGE_OPTIONS,
  CONFLICT_STYLE_OPTIONS,
  LOOKING_FOR_OPTIONS,
  COMMUNICATION_STYLE_OPTIONS,
  NON_NEGOTIABLES_OPTIONS,
  DIETARY_OPTIONS,
} from "@shared/schema";

interface ReferenceData {
  name: string;
  email: string;
  relationship: string;
}

interface FormData {
  firstName: string;
  age: string;
  neighborhood: string;
  genderIdentity: string;
  genderSelfDescribe: string;
  pronouns: string;
  pronounsOther: string;
  interestedIn: string[];
  values: string[];
  fridayNight: string;
  relationshipVision: string;
  pastLesson: string;
  loveLanguage: string;
  conflictStyle: string;
  lookingFor: string;
  communicationStyle: string;
  nonNegotiables: string[];
  unexpectedThing: string;
  dietaryPreferences: string[];
  readyToShowUp: boolean;
  communityAgreement: boolean;
  backgroundCheck: boolean;
  references: ReferenceData[];
}

const INITIAL_FORM: FormData = {
  firstName: "",
  age: "",
  neighborhood: "",
  genderIdentity: "",
  genderSelfDescribe: "",
  pronouns: "",
  pronounsOther: "",
  interestedIn: [],
  values: [],
  fridayNight: "",
  relationshipVision: "",
  pastLesson: "",
  loveLanguage: "",
  conflictStyle: "",
  lookingFor: "",
  communicationStyle: "",
  nonNegotiables: [],
  unexpectedThing: "",
  dietaryPreferences: [],
  readyToShowUp: false,
  communityAgreement: false,
  backgroundCheck: false,
  references: [
    { name: "", email: "", relationship: "" },
    { name: "", email: "", relationship: "" },
  ],
};

const DEMO_PREFILL: FormData = {
  firstName: "Alex",
  age: "34",
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

type ArrayKeys = "values" | "nonNegotiables" | "dietaryPreferences" | "interestedIn";

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
      <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
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
  const [showConnect, setShowConnect] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const totalSteps = 6;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: ArrayKeys, item: string, max?: number) => {
    setForm((prev) => {
      const arr = prev[key];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter((v) => v !== item) };
      }
      if (max && arr.length >= max) return prev;
      return { ...prev, [key]: [...arr, item] };
    });
  };

  const handleImport = (source: string) => {
    setImporting(source);
    setTimeout(() => {
      setForm(DEMO_PREFILL);
      setImporting(null);
      setShowConnect(false);
    }, 1500);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 0:
        return (
          form.firstName.trim().length > 0 &&
          Number(form.age) >= 25 &&
          form.neighborhood.trim().length > 0 &&
          form.genderIdentity.length > 0 &&
          (form.genderIdentity !== "Prefer to self-describe" || form.genderSelfDescribe.trim().length > 0) &&
          form.pronouns.length > 0 &&
          (form.pronouns !== "Other" || form.pronounsOther.trim().length > 0) &&
          form.interestedIn.length > 0
        );
      case 1:
        return form.values.length >= 1 && form.values.length <= 3 && form.fridayNight.length > 0;
      case 2:
        return form.loveLanguage.length > 0 && form.conflictStyle.length > 0;
      case 3:
        return form.lookingFor.length > 0 && form.communicationStyle.length > 0 && form.nonNegotiables.length >= 1 && form.nonNegotiables.length <= 2;
      case 4:
        return form.unexpectedThing.trim().length > 0 && form.dietaryPreferences.length >= 1 && form.readyToShowUp;
      case 5:
        return form.communityAgreement && form.backgroundCheck && form.references[0].name.trim().length > 0 && form.references[0].email.trim().length > 0 && form.references[0].relationship.trim().length > 0;
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
    else setShowConnect(true);
  };

  if (showConnect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-8 sm:py-24">
        <div className="w-full max-w-lg">
          <Card className="border-0 bg-card/60 overflow-visible">
            <CardContent className="pt-8 pb-8 px-5 sm:px-8">
              {importing ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ animation: "connectFadeIn 0.3s ease-out" }}>
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-5" />
                  <p className="text-lg font-medium text-foreground" data-testid="text-importing">
                    Importing your profile...
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will just take a moment.
                  </p>
                </div>
              ) : (
                <div style={{ animation: "connectFadeIn 0.4s ease-out" }}>
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-connect-title">
                      Speed up your setup
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-connect-subtitle">
                      Connect your profiles to pre-fill your information. We never post on your behalf.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleImport("linkedin")}
                      data-testid="button-import-linkedin"
                      className="w-full flex items-center gap-3 rounded-md border border-border bg-card text-foreground text-sm font-medium transition-colors cursor-pointer hover-elevate"
                      style={{ padding: "12px 16px" }}
                    >
                      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "#0A66C2" }}>
                        <SiLinkedin className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-medium">LinkedIn</span>
                        <span className="block text-xs text-muted-foreground">Import career & interests</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleImport("instagram")}
                      data-testid="button-import-instagram"
                      className="w-full flex items-center gap-3 rounded-md border border-border bg-card text-foreground text-sm font-medium transition-colors cursor-pointer hover-elevate"
                      style={{ padding: "12px 16px" }}
                    >
                      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)" }}>
                        <SiInstagram className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-medium">Instagram</span>
                        <span className="block text-xs text-muted-foreground">Import interests & lifestyle</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleImport("spotify")}
                      data-testid="button-import-spotify"
                      className="w-full flex items-center gap-3 rounded-md border border-border bg-card text-foreground text-sm font-medium transition-colors cursor-pointer hover-elevate"
                      style={{ padding: "12px 16px" }}
                    >
                      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "#1DB954" }}>
                        <SiSpotify className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block font-medium">Spotify</span>
                        <span className="block text-xs text-muted-foreground">Import music taste</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleImport("goodreads")}
                      data-testid="button-import-goodreads"
                      className="w-full flex items-center gap-3 rounded-md border border-border bg-card text-foreground text-sm font-medium transition-colors cursor-pointer hover-elevate"
                      style={{ padding: "12px 16px" }}
                    >
                      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "#5C4033" }}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                          <path d="M11.43 23.995c-3.608-.208-6.274-2.077-7.926-5.371-.515-1.026-.939-2.17-1.273-3.341-.333-1.17-.538-2.397-.62-3.681a18.5 18.5 0 0 1 .08-3.29c.142-1.14.377-2.218.703-3.235.326-1.017.75-1.955 1.272-2.813A8.8 8.8 0 0 1 5.6 .403C6.457-.195 7.467-.267 8.556.403c.619.38 1.104.904 1.458 1.572.354.668.616 1.39.787 2.168.17.778.26 1.584.267 2.418.008.834-.045 1.654-.16 2.459v.028l.011-.012c.236-.413.524-.79.865-1.133.34-.342.726-.638 1.156-.887.43-.25.892-.443 1.389-.58a5.51 5.51 0 0 1 1.53-.207c.598.013 1.173.113 1.725.3.552.186 1.063.456 1.534.808.47.353.884.789 1.24 1.309.357.52.637 1.118.84 1.794.204.676.318 1.428.343 2.255.025.828-.046 1.715-.213 2.661-.237 1.337-.666 2.518-1.288 3.543a8.1 8.1 0 0 1-2.192 2.506c-.871.67-1.836 1.133-2.893 1.389-1.058.256-2.145.256-3.263 0a6.4 6.4 0 0 1-1.475-.591 5.8 5.8 0 0 1-1.204-.907l-.064-.068v.04c0 .132-.005.263-.014.39-.01.128-.033.282-.068.464h-2.125v-.104zm2.24-7.612c.196-.595.338-1.232.427-1.912.089-.68.122-1.375.099-2.087-.024-.711-.107-1.413-.25-2.105a10.5 10.5 0 0 0-.601-1.963 6 6 0 0 0-.978-1.636 3.5 3.5 0 0 0-1.3-.994c-.476-.223-.99-.293-1.543-.208-.552.084-1.04.323-1.464.716a5 5 0 0 0-1.075 1.461 9.4 9.4 0 0 0-.718 1.962 13 13 0 0 0-.378 2.18c-.065.741-.055 1.46.029 2.155.084.696.238 1.341.464 1.937.226.596.533 1.112.921 1.547.388.435.876.74 1.463.916.587.175 1.137.17 1.65-.015a4.3 4.3 0 0 0 1.338-.825 5.6 5.6 0 0 0 1.02-1.274c.29-.495.52-1.016.686-1.563l.21-.292z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <span className="block font-medium">Goodreads</span>
                        <span className="block text-xs text-muted-foreground">Import reading interests</span>
                      </div>
                    </button>
                  </div>

                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowConnect(false)}
                      className="text-sm text-muted-foreground transition-colors cursor-pointer underline underline-offset-2"
                      data-testid="button-skip-connect"
                    >
                      Skip — I'll fill it out myself
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-border">
                    <Lock className="h-3 w-3 text-muted-foreground/60" />
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed" data-testid="text-connect-privacy">
                      Your data is only used for matching. We never store your social credentials.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <style>{`
          @keyframes connectFadeIn {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-8 sm:py-24">
      <div className="w-full max-w-lg">
        <ProgressBar step={step} total={totalSteps} />

        <Card className="border-0 bg-card/60 overflow-visible">
          <CardContent className="pt-8 pb-8 px-5 sm:px-8 relative">
            <StepWrapper visible={step === 0}>
              <Step1 form={form} updateField={updateField} toggleArrayItem={toggleArrayItem} />
            </StepWrapper>
            <StepWrapper visible={step === 1}>
              <Step2 form={form} toggleArrayItem={toggleArrayItem} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 2}>
              <StepDeeper form={form} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 3}>
              <Step3 form={form} toggleArrayItem={toggleArrayItem} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 4}>
              <Step4 form={form} toggleArrayItem={toggleArrayItem} updateField={updateField} />
            </StepWrapper>
            <StepWrapper visible={step === 5}>
              <StepSafety form={form} updateField={updateField} updateReference={(idx, field, value) => {
                setForm(prev => {
                  const refs = [...prev.references];
                  refs[idx] = { ...refs[idx], [field]: value };
                  return { ...prev, references: refs };
                });
              }} />
            </StepWrapper>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
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

function Step1({
  form,
  updateField,
  toggleArrayItem,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  toggleArrayItem: (key: ArrayKeys, item: string, max?: number) => void;
}) {
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

        <div>
          <Label className="text-sm font-medium">I identify as</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {GENDER_IDENTITY_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={form.genderIdentity === opt}
                onClick={() => {
                  updateField("genderIdentity", opt);
                  if (opt !== "Prefer to self-describe") updateField("genderSelfDescribe", "");
                }}
                testId={`chip-gender-${opt.toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
          {form.genderIdentity === "Prefer to self-describe" && (
            <Input
              placeholder="How do you identify?"
              value={form.genderSelfDescribe}
              onChange={(e) => updateField("genderSelfDescribe", e.target.value)}
              data-testid="input-gender-self-describe"
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">My pronouns</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRONOUNS_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={form.pronouns === opt}
                onClick={() => {
                  updateField("pronouns", opt);
                  if (opt !== "Other") updateField("pronounsOther", "");
                }}
                testId={`chip-pronoun-${opt.toLowerCase().replace(/\//g, "-")}`}
              />
            ))}
          </div>
          {form.pronouns === "Other" && (
            <Input
              placeholder="Your pronouns"
              value={form.pronounsOther}
              onChange={(e) => updateField("pronounsOther", e.target.value)}
              data-testid="input-pronouns-other"
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">I'm interested in</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTED_IN_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={form.interestedIn.includes(opt)}
                onClick={() => toggleArrayItem("interestedIn", opt)}
                testId={`chip-interested-${opt.toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
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
  toggleArrayItem: (key: ArrayKeys, item: string, max?: number) => void;
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

function StepDeeper({
  form,
  updateField,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2" data-testid="text-step-title">
        A Bit Deeper
      </h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        These help us find people you'll genuinely click with.
      </p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="relationshipVision" className="text-sm font-medium">What does a committed relationship look like to you?</Label>
          <Textarea
            id="relationshipVision"
            placeholder="e.g. A partnership where we grow together but keep our own identities"
            value={form.relationshipVision}
            onChange={(e) => updateField("relationshipVision", e.target.value.slice(0, 200))}
            data-testid="input-relationship-vision"
            className="mt-1.5 resize-none"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{form.relationshipVision.length}/200</p>
        </div>

        <div>
          <Label htmlFor="pastLesson" className="text-sm font-medium">A lesson from a past relationship you're grateful for:</Label>
          <Textarea
            id="pastLesson"
            placeholder="e.g. I learned that I need someone who communicates openly"
            value={form.pastLesson}
            onChange={(e) => updateField("pastLesson", e.target.value.slice(0, 200))}
            data-testid="input-past-lesson"
            className="mt-1.5 resize-none"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{form.pastLesson.length}/200</p>
        </div>

        <div>
          <Label className="text-sm font-medium">Your love language?</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {LOVE_LANGUAGE_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                selected={form.loveLanguage === opt}
                onClick={() => updateField("loveLanguage", opt)}
                testId={`chip-love-${opt.toLowerCase().replace(/\s/g, "-")}`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">How do you handle conflict?</Label>
          <div className="space-y-2 mt-3">
            {CONFLICT_STYLE_OPTIONS.map((opt) => (
              <RadioOption
                key={opt}
                label={opt}
                selected={form.conflictStyle === opt}
                onClick={() => updateField("conflictStyle", opt)}
                testId={`radio-conflict-${opt.slice(0, 10).toLowerCase().replace(/\s/g, "-")}`}
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
  toggleArrayItem: (key: ArrayKeys, item: string, max?: number) => void;
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
  toggleArrayItem: (key: ArrayKeys, item: string, max?: number) => void;
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

function StepSafety({
  form,
  updateField,
  updateReference,
}: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  updateReference: (idx: number, field: keyof ReferenceData, value: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-6 w-6 text-foreground/70" />
        <h2 className="font-serif text-2xl font-bold text-foreground" data-testid="text-step-title">
          Safety & Trust
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        We take your safety seriously. These steps help us build a trusted community.
      </p>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-semibold text-foreground">Community Agreement</Label>
          <div className="mt-2 p-4 rounded-md bg-card/80 border border-border text-sm text-foreground/90 leading-relaxed space-y-2" data-testid="text-community-agreement">
            <p>By joining Third Place, I agree to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Treat all members with respect and dignity</li>
              <li>Honor others' boundaries and consent</li>
              <li>Not engage in harassment, discrimination, or intimidation</li>
              <li>Report any behavior that makes me or others feel unsafe</li>
            </ul>
            <p className="text-muted-foreground text-xs pt-1">
              Third Place has zero tolerance for harassment, abuse, or criminal behavior. Violations result in immediate removal and may be reported to law enforcement.
            </p>
          </div>
          <div className="flex items-start gap-3 mt-3">
            <Checkbox
              id="communityAgreement"
              checked={form.communityAgreement}
              onCheckedChange={(checked) => updateField("communityAgreement", checked === true)}
              data-testid="checkbox-community-agreement"
            />
            <Label htmlFor="communityAgreement" className="text-sm leading-relaxed cursor-pointer">
              I agree to the Community Agreement
            </Label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-foreground">Verification</Label>
          <div className="flex items-start gap-3 mt-3">
            <Checkbox
              id="backgroundCheck"
              checked={form.backgroundCheck}
              onCheckedChange={(checked) => updateField("backgroundCheck", checked === true)}
              data-testid="checkbox-background-check"
            />
            <div>
              <Label htmlFor="backgroundCheck" className="text-sm leading-relaxed cursor-pointer">
                I consent to a background verification check
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                We partner with trusted third-party providers to ensure community safety. A basic background check is required before attending your first gathering.
              </p>
            </div>
          </div>
          {form.backgroundCheck && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20" data-testid="badge-verified-preview">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Verified</span>
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-semibold text-foreground">References</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Add 1-2 people who can vouch for you (friends, colleagues, or community members)
          </p>

          {form.references.map((ref, idx) => (
            <div key={idx} className="space-y-2 mb-4">
              <p className="text-xs font-medium text-muted-foreground">Reference {idx + 1}{idx === 1 ? " (optional)" : ""}</p>
              <Input
                placeholder="Name"
                value={ref.name}
                onChange={(e) => updateReference(idx, "name", e.target.value)}
                data-testid={`input-ref-name-${idx}`}
              />
              <Input
                placeholder="Email"
                type="email"
                value={ref.email}
                onChange={(e) => updateReference(idx, "email", e.target.value)}
                data-testid={`input-ref-email-${idx}`}
              />
              <Input
                placeholder='Relationship (e.g. "Friend", "Colleague")'
                value={ref.relationship}
                onChange={(e) => updateReference(idx, "relationship", e.target.value)}
                data-testid={`input-ref-relationship-${idx}`}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            We may reach out to your references before your first gathering. This keeps our community trusted and accountable.
          </p>
        </div>

        <p className="text-xs text-muted-foreground/80 italic pt-2 border-t border-border" data-testid="text-safety-note">
          Third Place gatherings are held in public venues. We recommend sharing your gathering details with a trusted friend. Your safety is our priority.
        </p>
      </div>
    </div>
  );
}
