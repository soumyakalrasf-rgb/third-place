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

const gatheringSchema = z.object({
  group: z.array(matchMemberSchema).min(3).max(5),
  event: matchEventSchema,
  compatibilityScore: z.number().min(75).max(98),
});

const multiMatchResponseSchema = z.object({
  gatherings: z.array(gatheringSchema).length(3),
  recommendedGathering: z.number().min(0).max(2),
});

const anthropic = new Anthropic();

const MATCH_SYSTEM_PROMPT = `You are the matching engine for Third Place, a community gathering platform for serious daters aged 30+. 

CRITICAL MATCHING RULES — GENDER & SEXUALITY AWARENESS:
- Each profile includes "genderIdentity", "pronouns", and "interestedIn" fields.
- You MUST respect sexual orientation and gender preferences. Only match people who are compatible based on their "interestedIn" preferences.
- "interestedIn" indicates which genders a person is attracted to.
- NEVER assume heteronormative pairings. A woman is not automatically interested in men.
- When forming each group, ensure ALL members could plausibly be romantically compatible with the user based on mutual gender/orientation alignment.
- Use each person's pronouns correctly in your response.

MATCHING PRIORITIES:
1. Gender/orientation compatibility (MANDATORY — disqualify incompatible matches)
2. Shared or complementary values
3. Compatible communication and conflict styles
4. Alignment on relationship intentions (lookingFor)
5. Emotional depth signals (relationshipVision, pastLesson, loveLanguage)

YOUR TASK: Create 3 DIFFERENT gatherings from the candidate pool. Each gathering should have:
- A different group of 4 people (try to minimize overlap between groups)
- A different event type chosen from these categories based on each group's personality:
  * Curated Dinner — intimate restaurant dinner with conversation prompts
  * Adventure Outing — hike, kayaking, or outdoor activity
  * Creative Workshop — pottery, painting, cooking class
  * Cultural Night — jazz bar, comedy show, live music
  * Game & Social — board game cafe, trivia night, escape room
  * Sunday Brunch — relaxed daytime gathering
  * Book & Ideas Club — discussion-based gathering around a theme
  * Wellness Experience — group yoga, sound bath, nature walk
- A different vibe/energy (e.g., one cozy, one adventurous, one creative)
- A compatibilityScore from 75-98 reflecting how well the group fits together

The user appears in all 3 gatherings because they connect with different people in different ways.
Set "recommendedGathering" to the index (0, 1, or 2) of the BEST overall fit.

Each gathering's event must be genuinely different — for example a cozy dinner, a weekend hike, and a creative workshop. Each at a DIFFERENT real SF Bay Area venue.

Respond in this exact JSON format and nothing else:
{
  "gatherings": [
    {
      "group": [
        {
          "id": "profile_id",
          "name": "first name",
          "age": 00,
          "neighborhood": "area",
          "matchReason": "A warm, specific 1-2 sentence reason"
        }
      ],
      "event": {
        "title": "A creative, inviting event name",
        "type": "dinner/adventure/workshop/cultural/game/brunch/ideas/wellness",
        "description": "2-3 sentences describing this specific gathering",
        "venue": "A real or realistic venue name in the SF Bay Area",
        "address": "A realistic address",
        "suggestedDate": "A day this coming week",
        "suggestedTime": "A specific time",
        "conversationStarters": ["starter 1", "starter 2", "starter 3"],
        "whyThisEvent": "2-3 sentences explaining WHY this event type was chosen for THIS specific group"
      },
      "compatibilityScore": 92
    }
  ],
  "recommendedGathering": 0
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

  const pool = compatible.length >= 12 ? compatible : seedProfiles;

  const gathering1 = pool.slice(0, 4);
  const gathering2 = pool.slice(4, 8);
  const gathering3 = pool.slice(8, 12);

  const makeGroup = (profiles: typeof pool) =>
    profiles.map((p) => ({
      id: p.id,
      name: p.firstName,
      age: p.age,
      neighborhood: p.neighborhood,
      matchReason: `${p.firstName} shares your appreciation for meaningful connection and would bring great energy to the group.`,
    }));

  return {
    gatherings: [
      {
        group: makeGroup(gathering1),
        event: {
          title: "Sunset Supper & Stories",
          type: "dinner",
          description: "An intimate farm-to-table dinner on a rooftop overlooking the Bay. Each course comes with a conversation prompt designed to spark the kind of real talk that turns strangers into friends.",
          venue: "Foreign Cinema",
          address: "2534 Mission St, San Francisco, CA 94110",
          suggestedDate: "This Saturday",
          suggestedTime: "6:30 PM",
          conversationStarters: [
            "What's a small moment from this week that made you smile?",
            "If you could live anywhere for a year, no strings attached, where would you go?",
            "What's something you believed at 20 that you've completely changed your mind about?",
          ],
          whyThisEvent: "A shared meal is the oldest way humans build trust. This group values authenticity and deep conversation — a beautifully set table gives you the perfect stage.",
        },
        compatibilityScore: 94,
      },
      {
        group: makeGroup(gathering2),
        event: {
          title: "Golden Gate Sunrise Hike",
          type: "adventure",
          description: "A scenic morning hike along the Coastal Trail with stunning views of the Golden Gate Bridge. We'll stop at a hidden overlook for coffee and pastries, then explore Lands End together.",
          venue: "Lands End Trailhead",
          address: "680 Point Lobos Ave, San Francisco, CA 94121",
          suggestedDate: "This Sunday",
          suggestedTime: "8:00 AM",
          conversationStarters: [
            "What's the most adventurous thing you've done this year?",
            "Do you have a morning routine that sets up your day?",
            "What's a place that completely changed your perspective on life?",
          ],
          whyThisEvent: "This group has an adventurous spirit and loves being outdoors. Starting the day with fresh air and breathtaking views is the perfect way to build connections naturally.",
        },
        compatibilityScore: 88,
      },
      {
        group: makeGroup(gathering3.length >= 4 ? gathering3 : pool.slice(0, 4)),
        event: {
          title: "Hands & Hearts Pottery Session",
          type: "workshop",
          description: "A guided pottery workshop in a sun-filled Mission studio. You'll learn to throw on the wheel while sharing stories and laughter — there's something about working with clay that makes people open up.",
          venue: "Clay by the Bay Studio",
          address: "1499 Valencia St, San Francisco, CA 94110",
          suggestedDate: "Next Wednesday",
          suggestedTime: "7:00 PM",
          conversationStarters: [
            "When was the last time you tried something completely new?",
            "What's a creative skill you've always wanted to learn?",
            "If you could master any art form overnight, what would it be?",
          ],
          whyThisEvent: "This group values creativity and hands-on experiences. Working with clay together creates natural moments of vulnerability and laughter — the perfect ingredients for real connection.",
        },
        compatibilityScore: 85,
      },
    ],
    recommendedGathering: 0,
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
        max_tokens: 4000,
        system: MATCH_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      const parsed = JSON.parse(textBlock.text);
      const validated = multiMatchResponseSchema.safeParse(parsed);
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
