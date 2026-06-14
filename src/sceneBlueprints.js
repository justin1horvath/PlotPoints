// Scene descriptions can reference values with braces.
// Story: genre, setting, antagonist, plot, romanceDynamic
// Characters: name, role, gift, physicalDetail, goal, stats, turnOn, want
// Memory: summary, emotionalShift, unresolvedThreads, importantFacts, romanceBeat
// Mad Libs: use each prompt key, such as {madlibs.location}.
// A value is sent to the model only when the description references it.

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
    description: `Set the sceene by describe how {madlibs.location} fits into {story.setting}.
    Craft a dramatic and attention grabbing scene that shows {madlibs.intrigue} and alludes to {story.plot}.
    Show how {activePlayer.name}reaction these story developments based on their role as {activePlayer.role}.`,
    tone: "Dramatic",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      promptsPerPlayer: 1,
      charactersMeet: false,
    },
    madLibs: {
      promptPool: [
        {
          key: "location",
          label: "Location",
          placeholder: "a garbage-strewn alley, a windswept cliff, a locked room...",
        },
        {
          key: "intrigue",
          label: "Something intriguing",
          placeholder: "unknown footprints, a secret letter, a shadowy figure...",
        },
      ],
    },
    constraints: [
      "Create a brief teaser scene, not the full beginning of the plot.",
      "Describe the setting in a few vivid details.",
      "Hint at the plot and the antagonist without being explicit.",
      "Mad Libs may be dialogue, sensory detail, or action — weave them as the type they imply, not as labels to check off.",
      "If a Mad Libs input overlaps with or contradicts established story or character details, subordinate it to the story — use it as a detail within that world, not as a replacement for it.",
      "Do not include a roll-off, choice, or resolved dilemma yet.",
    ],
  },
  {
    number: 1,
    name: "Ordinary World",
    act: 1,
    type: "madlibs_scene",
    description: `Show the active player's ordinary world through {activePlayer.name}'s role as {activePlayer.role}, interacting with {madlibs.dailyObject}, and doing {madlibs.routineAction}.
As the active player solves {madlibs.smallProblem} with {madlibs.minorNpc}, hint at how the active player embodies the other player's {otherPlayer.turnOn} and the tension of {story.romanceDynamic}.
Let the ordinary world quietly carry the pressure of {story.plot}; use this prior memory as background pressure, not exposition: {memory.summary}.`,
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
      "Create one concise paragraph of narrative for the active character, showing who they are and what their life is like before they meet.",
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
      "Bring {activePlayer.name} and {otherPlayer.name} together at {madlibs.meetingPlace}. Use {madlibs.interruption} to force immediate contact, {madlibs.misreadSignal} to create friction or curiosity, and {madlibs.physicalDetail} as the concrete detail one character notices about the other. Let the scene carry the subtext of {story.romanceDynamic}; the relationship beat coming in is {memory.romanceBeat}.",
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
      "Use {madlibs.firstClue} and {madlibs.messenger} to reveal the call: {story.plot}. Put {activePlayer.name} and {otherPlayer.name} under pressure from {madlibs.deadline}, and use {madlibs.temptation} to make cooperation unavoidable. Bring forward these unresolved threads only if they help the call: {memory.unresolvedThreads}. Hint at {story.antagonist} without explaining it.",
    tone: "Urgent, enticing, and a little theatrical.",
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      promptPool: [
        {
          key: "firstClue",
          label: "The clue that starts the adventure",
          placeholder: "a ransome note, a cursed ring, a blood-stained map...",
        },
        {
          key: "messenger",
          label: "Who brings the cle",
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
      "Show why {activePlayer.name} hesitates or refuses the call because of {madlibs.excuse}, while {otherPlayer.name} complicates the moment through pressure from {madlibs.pressure}. Use {madlibs.symbol} as a concrete sign of what is at stake, and include {madlibs.sharpLine} as dialogue or near-dialogue. Keep {story.plot} present, hint at {story.antagonist}, and let this prior emotional shift shape the refusal: {memory.emotionalShift}.",
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
