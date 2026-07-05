import { z } from "zod";

export const SceneResponseSchema = z.object({
  title: z.string(),
  location: z.string(),
  setup: z.string(),
  goals: z.object({
    player1: z.string().nullable(),
    player2: z.string().nullable(),
  }),
  scenePlan: z.object({
    purpose: z.string(),
    activeObjective: z.string(),
    otherObjective: z.string().nullable(),
    conflict: z.string(),
    beats: z.array(z.string()).min(3).max(6),
    endingChange: z.string(),
  }),
  narrative: z.string(),
  storyLogEntry: z.object({
    summary: z.string(),
    emotionalShift: z.string(),
    unresolvedThreads: z.array(z.string()),
    importantFacts: z.array(z.string()),
    romanceBeat: z.string(),
  }),
  storyMemoryUpdates: z.object({
    currentSituation: z.string(),
    establishedFacts: z.object({
      add: z.array(z.string()),
      remove: z.array(z.string()),
    }),
    unresolvedMysteries: z.object({
      add: z.array(z.string()),
      resolve: z.array(z.string()),
    }),
    activeThreats: z.object({
      add: z.array(z.string()),
      resolve: z.array(z.string()),
    }),
    relationshipState: z.string().nullable(),
    openPromises: z.object({
      add: z.array(z.string()),
      resolve: z.array(z.string()),
    }),
  }),
});
