import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

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

  return httpServer;
}
