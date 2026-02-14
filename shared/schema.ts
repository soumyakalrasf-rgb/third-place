import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const GENDER_IDENTITY_OPTIONS = [
  "Woman", "Man", "Nonbinary", "Genderqueer", "Prefer to self-describe", "Prefer not to say",
] as const;

export const PRONOUNS_OPTIONS = [
  "She/her", "He/him", "They/them", "Other",
] as const;

export const INTERESTED_IN_OPTIONS = [
  "Women", "Men", "Nonbinary folks", "All genders",
] as const;

export const VALUES_OPTIONS = [
  "Authenticity", "Growth", "Family", "Adventure", "Stability", "Humor",
  "Ambition", "Spirituality", "Creativity", "Kindness", "Independence", "Community",
] as const;

export const FRIDAY_NIGHT_OPTIONS = [
  "Cook dinner and deep conversation",
  "Try a new restaurant",
  "Live music or comedy show",
  "Outdoor adventure",
  "Game night with friends",
  "Cozy night with a book",
] as const;

export const LOVE_LANGUAGE_OPTIONS = [
  "Words of Affirmation", "Quality Time", "Acts of Service", "Physical Touch", "Receiving Gifts",
] as const;

export const CONFLICT_STYLE_OPTIONS = [
  "Talk it through immediately",
  "Need space first then talk",
  "Write my feelings down",
  "Use humor to defuse",
] as const;

export const LOOKING_FOR_OPTIONS = [
  "A life partner",
  "A serious relationship",
  "Exploring with intention",
  "Building my community first",
] as const;

export const COMMUNICATION_STYLE_OPTIONS = [
  "Direct and honest",
  "Warm and nurturing",
  "Playful and witty",
  "Thoughtful and reserved",
] as const;

export const NON_NEGOTIABLES_OPTIONS = [
  "Emotional availability", "Shared life goals", "Intellectual connection",
  "Physical chemistry", "Financial stability", "Same page on kids",
  "Sense of humor", "Aligned values",
] as const;

export const DIETARY_OPTIONS = [
  "No restrictions", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher",
] as const;

export const insertProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  age: z.number().min(25, "Must be at least 25").max(120),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  genderIdentity: z.string().min(1),
  genderSelfDescribe: z.string().optional().default(""),
  pronouns: z.string().min(1),
  pronounsOther: z.string().optional().default(""),
  interestedIn: z.array(z.string()).min(1),
  values: z.array(z.string()).min(1).max(3),
  fridayNight: z.string().min(1),
  relationshipVision: z.string().optional().default(""),
  pastLesson: z.string().optional().default(""),
  loveLanguage: z.string().optional().default(""),
  conflictStyle: z.string().optional().default(""),
  lookingFor: z.string().min(1),
  communicationStyle: z.string().min(1),
  nonNegotiables: z.array(z.string()).min(1).max(2),
  unexpectedThing: z.string().min(1, "Tell us something unexpected"),
  dietaryPreferences: z.array(z.string()).min(1),
  readyToShowUp: z.boolean().refine((v) => v === true, "You must be ready to show up"),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = InsertProfile & { id: string };
