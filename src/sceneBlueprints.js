export const SCENE_BLUEPRINTS = [
  {
    number: 1,
    name: "Ordinary World",
    act: 1,
    type: "madlibs_scene",
    description:
      "Show who each character is before they know each other. The characters should not meet yet.",
    tone: "Playful, vivid, emotionally observant, with a hint of longing.",
    rules: {
      promptsPerPlayer: 2,
      madLibAssignment: "split_random",
      includeChoice: false,
      includeRollOff: false,
      charactersMeet: false,
    },
    madLibs: {
      promptPool: [
        {
          key: "word",
          label: "A vivid word",
          placeholder: "moonlit, stubborn, velvet...",
        },
        {
          key: "npc",
          label: "A character or NPC",
          placeholder: "the lighthouse keeper, a nervous duke...",
        },
        {
          key: "action",
          label: "An action",
          placeholder: "drops a key, starts singing...",
        },
        {
          key: "funny",
          label: "Something funny",
          placeholder: "a cursed teapot, terrible flirting...",
        },
      ],
    },
    constraints: [
      "Create one concise paragraph of narrative for each character, showing who they are and what their life is like before they meet.",
      "The characters should not meet yet.",
      "Use all four Mad Libs inputs naturally.",
      "Do not reveal either private turn on or private want directly; only imply them.",
      "Do not include a roll-off, choice, or dilemma yet.",
    ],
  },
];

// Finds the blueprint that controls one scene's purpose and interaction type.
export function getSceneBlueprint(sceneNumber) {
  const blueprint = SCENE_BLUEPRINTS.find((scene) => scene.number === sceneNumber);

  if (!blueprint) {
    throw new Error(`No scene blueprint found for scene ${sceneNumber}.`);
  }

  return blueprint;
}
