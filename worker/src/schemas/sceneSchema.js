import { z } from "zod";

export const SceneResponseSchema = z.object({
  title: z.string(),
  location: z.string(),
  setup: z.string(),
  goals: z.object({
    player1: z.string(),
    player2: z.string(),
  }),
  narrative: z.string(),
  storyLogEntry: z.object({
    summary: z.string(),
    emotionalShift: z.string(),
    unresolvedThreads: z.array(z.string()),
    importantFacts: z.array(z.string()),
    romanceBeat: z.string(),
  }),
});
