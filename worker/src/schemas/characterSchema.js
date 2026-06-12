import { z } from "zod";

const StatsSchema = z.object({
  guts: z.number().int(),
  charm: z.number().int(),
  wit: z.number().int(),
  heart: z.number().int(),
});

export const CharacterResponseSchema = z.object({
  players: z
    .array(
      z.object({
        number: z.number().int(),
        name: z.string(),
        physicalDetail: z.string(),
        stats: StatsSchema,
      })
    )
    .length(2),
});

// Validates game-specific stat rules after the schema shape is confirmed.
export function validateCharacterResponse(data) {
  data.players.forEach((player) => {
    // Confirms each player has exactly the stat spread the game expects.
    const statSpread = Object.values(player.stats).sort((a, b) => a - b).join(",");
    if (statSpread !== "2,3,3,4") {
      throw new Error(`Player ${player.number} stats must be one 2, two 3s, and one 4.`);
    }
  });

  return data;
}
