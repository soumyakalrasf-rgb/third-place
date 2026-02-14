import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import Anthropic from "@anthropic-ai/sdk";
import { seedProfiles } from "./seedProfiles";
import { z } from "zod";

const matchRequestSchema = z.object({
  profileId: z.string().min(1, "profileId is required"),
});

const matchMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  neighborhood: z.string(),
  matchReason: z.string(),
});

const matchEventSchema = z.object({
  title: z.string(),
  type: z.string(),
  description: z.string(),
  venue: z.string(),
  address: z.string(),
  suggestedDate: z.string(),
  suggestedTime: z.string(),
  conversationStarters: z.array(z.string()),
  whyThisEvent: z.string(),
});

const matchResponseSchema = z.object({
  group: z.array(matchMemberSchema).length(4),
  event: matchEventSchema,
});

const anthropic = new Anthropic();

const MATCH_SYSTEM_PROMPT = `You are the matching engine for Third Place, a community gathering platform for serious daters aged 30+. 

CRITICAL MATCHING RULES — GENDER & SEXUALITY AWARENESS:
- Each profile includes "genderIdentity", "pronouns", and "interestedIn" fields.
- You MUST respect sexual orientation and gender preferences. Only match people who are compatible based on their "interestedIn" preferences.
- "interestedIn" indicates which genders a person is attracted to. For example:
  - A woman interested in ["Women"] should only be matched with women or nonbinary folks who are also interested in women.
  - A man interested in ["Men"] should only be matched with men or nonbinary folks who are also interested in men.
  - Someone interested in ["All genders"] is open to anyone.
- NEVER assume heteronormative pairings. A woman is not automatically interested in men.
- When forming a group of 4 matches, ensure ALL members could plausibly be romantically compatible with the user based on mutual gender/orientation alignment.
- Use each person's pronouns correctly in your response.

MATCHING PRIORITIES:
1. Gender/orientation compatibility (MANDATORY — disqualify incompatible matches)
2. Shared or complementary values
3. Compatible communication and conflict styles
4. Alignment on relationship intentions (lookingFor)
5. Emotional depth signals (relationshipVision, pastLesson, loveLanguage)

Given a user profile and a list of candidate profiles, your job is to:
1. Filter candidates by gender/orientation compatibility first
2. Select the 4 best-matched candidates from the compatible pool
3. Generate a curated micro-event tailored to the group's shared interests
4. Write a warm, specific matchReason for each person that references concrete details — shared values, complementary communication styles, compatible love languages, or insights from their deeper answers

Respond in this exact JSON format and nothing else:
{
  "group": [
    {
      "id": "profile_id",
      "name": "first name",
      "age": 00,
      "neighborhood": "area",
      "matchReason": "A warm, specific 1-2 sentence reason referencing shared values, complementary styles, or emotional depth"
    }
  ],
  "event": {
    "title": "A creative, inviting event name",
    "type": "dinner/hike/workshop/game night/etc",
    "description": "2-3 sentences describing the gathering — make it sound irresistible and specific",
    "venue": "A real or realistic venue name in the SF Bay Area",
    "address": "A realistic address",
    "suggestedDate": "This coming Saturday",
    "suggestedTime": "A specific time like 6:30 PM",
    "conversationStarters": [
      "A thoughtful icebreaker question for the group",
      "Another one",
      "A third one"
    ],
    "whyThisEvent": "1-2 sentences explaining why this specific event was chosen for this specific group"
  }
}`;

function getFallbackMatch(userProfile: any) {
  const userInterests = userProfile.interestedIn || ["All genders"];
  const userGender = userProfile.genderIdentity || "Prefer not to say";

  const genderMap: Record<string, string[]> = {
    "Woman": ["Women"],
    "Man": ["Men"],
    "Nonbinary": ["Nonbinary folks", "All genders"],
    "Genderqueer": ["Nonbinary folks", "All genders"],
  };

  const userGenderLabels = genderMap[userGender] || ["All genders"];

  const compatible = seedProfiles.filter((p) => {
    const candidateGenderLabels = genderMap[p.genderIdentity] || ["All genders"];
    const userInterestedInCandidate =
      userInterests.includes("All genders") ||
      candidateGenderLabels.some((g: string) => userInterests.includes(g));
    const candidateInterestedInUser =
      p.interestedIn.includes("All genders") ||
      userGenderLabels.some((g: string) => p.interestedIn.includes(g));
    return userInterestedInCandidate && candidateInterestedInUser;
  });

  const picked = (compatible.length >= 4 ? compatible : seedProfiles).slice(0, 4);

  return {
    group: picked.map((p) => ({
      id: p.id,
      name: p.firstName,
      age: p.age,
      neighborhood: p.neighborhood,
      matchReason: `${p.firstName} shares your appreciation for meaningful connection and would bring great energy to the group.`,
    })),
    event: {
      title: "Sunset Supper & Stories",
      type: "dinner",
      description:
        "An intimate farm-to-table dinner on a rooftop overlooking the Bay. Each course comes with a conversation prompt designed to spark the kind of real talk that turns strangers into friends.",
      venue: "Foreign Cinema",
      address: "2534 Mission St, San Francisco, CA 94110",
      suggestedDate: "This coming Saturday",
      suggestedTime: "6:30 PM",
      conversationStarters: [
        "What's a small moment from this week that made you smile?",
        "If you could live anywhere for a year, no strings attached, where would you go?",
        "What's something you believed at 20 that you've completely changed your mind about?",
      ],
      whyThisEvent:
        "A shared meal is the oldest way humans build trust. This group values authenticity and deep conversation — a beautifully set table gives you the perfect stage.",
    },
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/profiles", async (req, res) => {
    const result = insertProfileSchema.safeParse(req.body);
    if (!result.success) {
      const validationError = fromError(result.error);
      return res.status(400).json({ message: validationError.toString() });
    }
    const profile = await storage.createProfile(result.data);
    return res.status(201).json(profile);
  });

  app.get("/api/profiles/:id", async (req, res) => {
    const profile = await storage.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.json(profile);
  });

  app.post("/api/match", async (req, res) => {
    const reqResult = matchRequestSchema.safeParse(req.body);
    if (!reqResult.success) {
      const validationError = fromError(reqResult.error);
      return res.status(400).json({ message: validationError.toString() });
    }

    const userProfile = await storage.getProfile(reqResult.data.profileId);
    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    try {
      const userPrompt = `Here is the user's profile:\n${JSON.stringify(userProfile, null, 2)}\n\nHere are the candidate profiles:\n${JSON.stringify(seedProfiles, null, 2)}`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: MATCH_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      const parsed = JSON.parse(textBlock.text);
      const validated = matchResponseSchema.safeParse(parsed);
      if (!validated.success) {
        console.error("Claude response validation failed:", validated.error.message);
        throw new Error("Invalid match response structure");
      }

      return res.json(validated.data);
    } catch (error: any) {
      console.error("Claude API error, using fallback:", error.message);
      return res.json(getFallbackMatch(userProfile));
    }
  });

  return httpServer;
}
