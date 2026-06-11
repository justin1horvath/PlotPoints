const DEFAULT_MADLIB_RULES = {
  promptsPerPlayer: 2,
  madLibAssignment: "split_random",
  includeChoice: false,
  includeRollOff: false,
};

export const SCENE_BLUEPRINTS = [
  {
    number: 0,
    name: "Cold Open",
    act: 1,
    type: "madlibs_scene",
    description:
      "Open with a bold, cinematic tease of the main plot. Hint at the primary conflict.",
    tone: "Romantic, punchy, mysterious, and concise.",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: false,
    },
    madLibs: {
      promptPool: [
        {
          key: "ominousObject",
          label: "An ominous object",
          placeholder: "a cracked mirror, a red glove, a sealed letter...",
        },
        {
          key: "publicPlace",
          label: "A public place",
          placeholder: "a train platform, a moonlit ballroom...",
        },
        {
          key: "dangerousAction",
          label: "A dangerous action",
          placeholder: "vanishes into smoke, steals a horse...",
        },
        {
          key: "romanticImage",
          label: "A romantic image",
          placeholder: "rain on velvet, trembling candlelight...",
        },
      ],
    },
    constraints: [
      "Create a brief teaser scene, not the full beginning of the plot.",
      "Hint at both main characters without explaining their backstories.",
      "The characters should not meet yet.",
      "Use all four Mad Libs inputs naturally.",
      "Do not include a roll-off, choice, or resolved dilemma yet.",
    ],
  },
  {
    number: 1,
    name: "Ordinary World",
    act: 1,
    type: "madlibs_scene",
    description:
      "Show what each character's normal life looks like before the adventure fully begins. The scene should reveal habits, pressures, and emotional gaps.",
    tone: "Playful, vivid, emotionally observant, with a hint of longing.",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: false,
    },
    madLibs: {
      promptPool: [
        {
          key: "dailyObject",
          label: "An everyday object",
          placeholder: "a chipped teacup, a silver key, a worn notebook...",
        },
        {
          key: "minorNpc",
          label: "A minor character",
          placeholder: "a nosy aunt, a nervous clerk, a street magician...",
        },
        {
          key: "routineAction",
          label: "A routine action",
          placeholder: "locks the gate, burns breakfast, rehearses a lie...",
        },
        {
          key: "smallProblem",
          label: "A small problem",
          placeholder: "a missing shoe, a bad omen, a jealous cat...",
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
  {
    number: 2,
    name: "The Meeting",
    act: 1,
    type: "madlibs_scene",
    description:
      "Bring both characters into the same scene for the first time. Their meeting should create immediate friction, curiosity, or attraction without settling what they mean to each other.",
    tone: "Charged, charming, awkward, and specific.",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      promptPool: [
        {
          key: "meetingPlace",
          label: "Where they meet",
          placeholder: "a foggy pier, a packed theater, a broken elevator...",
        },
        {
          key: "interruption",
          label: "An interruption",
          placeholder: "a shouted accusation, a falling chandelier...",
        },
        {
          key: "misreadSignal",
          label: "Something misunderstood",
          placeholder: "a wink, a stolen glance, a dropped invitation...",
        },
        {
          key: "physicalDetail",
          label: "A physical detail",
          placeholder: "ink-stained cuffs, a torn sleeve, red lipstick...",
        },
      ],
    },
    constraints: [
      "The characters must meet in this scene.",
      "Create immediate tension, curiosity, or attraction between them.",
      "Use all four Mad Libs inputs naturally.",
      "Do not make either character confess love or trust yet.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 3,
    name: "Call to Adventure",
    act: 1,
    type: "madlibs_scene",
    description:
      "Introduce the quest, problem, invitation, or opportunity that pulls the characters out of normal life. The call should make cooperation useful, inconvenient, or unavoidable.",
    tone: "Urgent, enticing, and a little theatrical.",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      promptPool: [
        {
          key: "callObject",
          label: "The thing that starts it",
          placeholder: "a telegram, a cursed ring, a blood-red map...",
        },
        {
          key: "messenger",
          label: "Who brings the call",
          placeholder: "a breathless courier, a rival, a ghost...",
        },
        {
          key: "deadline",
          label: "A ticking clock",
          placeholder: "before midnight, by the next train...",
        },
        {
          key: "temptation",
          label: "A tempting reward",
          placeholder: "a fortune, freedom, forbidden knowledge...",
        },
      ],
    },
    constraints: [
      "Introduce a clear adventure hook that affects both characters.",
      "Make cooperation between the characters useful, inconvenient, or unavoidable.",
      "Use all four Mad Libs inputs naturally.",
      "Keep the scene unresolved so the next scene can explore hesitation.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 4,
    name: "Refusal",
    act: 1,
    type: "madlibs_scene",
    description:
      "Show why the characters hesitate, resist, or complicate the call. Their refusal should reveal fear, pride, duty, desire, or a reason they cannot simply say yes.",
    tone: "Tense, intimate, restrained, and character-driven.",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      promptPool: [
        {
          key: "excuse",
          label: "A reason to refuse",
          placeholder: "a family debt, a secret promise, a bad prophecy...",
        },
        {
          key: "pressure",
          label: "Something applying pressure",
          placeholder: "rain at the window, a judge's stare...",
        },
        {
          key: "symbol",
          label: "A meaningful symbol",
          placeholder: "a cracked locket, a burnt photograph...",
        },
        {
          key: "sharpLine",
          label: "A sharp line of dialogue",
          placeholder: "I do not owe fate a thing...",
        },
      ],
    },
    constraints: [
      "Show why at least one character hesitates or refuses the adventure.",
      "Reveal emotional stakes without explaining private turn ons or wants directly.",
      "Use all four Mad Libs inputs naturally.",
      "End with tension still unresolved.",
      "Do not include a roll-off or choice yet.",
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

// Returns the next scene number if one is available.
export function getNextSceneNumber(currentSceneNumber) {
  const nextScene = [...SCENE_BLUEPRINTS]
    .sort((firstScene, secondScene) => firstScene.number - secondScene.number)
    .find((scene) => scene.number > currentSceneNumber);

  return nextScene?.number ?? null;
}
