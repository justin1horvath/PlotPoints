// Scene descriptions can reference values with braces.
// Story: genre, setting, antagonist, plot, romanceDynamic
// Characters: name, role, gift, physicalDetail, goal, stats, turnOn, want
// Memory: currentSituation, establishedFacts, unresolvedMysteries, activeThreats, relationshipState, openPromises
// Mad Libs: use each prompt key, such as {madlibs.location}.
// A value is sent to the model only when the description references it.

const DEFAULT_MADLIB_RULES = {
  includeChoice: false,
  includeRollOff: false,
};

// Defines the exact continuity responsibilities for each scene.
const SCENE_MEMORY_UPDATES = {
  0: {
    currentSituation: "Record the active character's location and the unexplained sign that ends the teaser.",
    establishedFacts: "Add only concrete details that the active character directly confirms.",
    unresolvedMysteries: "Add the central question raised by the intriguing sign; resolve nothing.",
    activeThreats: "Add a threat only if danger becomes concrete rather than merely ominous.",
    relationshipState: "Preserve the relationship state because the other character is absent.",
    openPromises: "Add only an explicit intention or obligation created by the active character's response.",
  },
  1: {
    currentSituation: "Record the ordinary problem's outcome and the active character's immediate situation.",
    establishedFacts: "Add durable facts about the active character's routine, environment, and recurring NPC.",
    unresolvedMysteries: "Preserve existing mysteries; add one only if the scene directly introduces unexplained evidence.",
    activeThreats: "Preserve existing threats and do not turn the ordinary problem into a new major danger.",
    relationshipState: "Preserve the relationship state because the other character is absent.",
    openPromises: "Add any explicit obligation left by the ordinary problem; resolve one only if completed on screen.",
  },
  2: {
    currentSituation: "Record where the characters part or remain together and the obstacle created by their misunderstanding.",
    establishedFacts: "Add the meeting circumstances and only observations the characters directly learn about each other.",
    unresolvedMysteries: "Preserve plot mysteries; do not treat romantic uncertainty as a supernatural mystery.",
    activeThreats: "Preserve active threats unless one directly intrudes on the meeting.",
    relationshipState: "Replace it with the characters' specific first impression, attraction, and immediate friction.",
    openPromises: "Add any explicit plan, invitation, debt, or agreement to meet again.",
  },
  3: {
    currentSituation: "Record the inciting incident, the immediate stakes, and why both characters remain involved.",
    establishedFacts: "Add the visitor's confirmed identity or role and facts clearly revealed about the central plot.",
    unresolvedMysteries: "Add the unexplained detail and unanswered question; resolve only questions explicitly answered by the visitor.",
    activeThreats: "Add the concrete danger exposed by the incident and connect it to an existing threat when possible.",
    relationshipState: "Update only if the characters' response creates new cooperation, conflict, or reliance.",
    openPromises: "Add commitments to investigate, protect someone, deliver information, or take a next step.",
  },
  4: {
    currentSituation: "Record the clue, why the characters are needed, and the specific next investigative step.",
    establishedFacts: "Add the omen, clue, and confirmed reason the characters can interpret or pursue it.",
    unresolvedMysteries: "Add the clue's unanswered meaning; resolve any earlier question the clue directly answers.",
    activeThreats: "Update the established threat with any new evidence of proximity or urgency.",
    relationshipState: "Update only if recognizing each other's usefulness changes their cooperation or attraction.",
    openPromises: "Add the agreed next step; resolve any earlier promise fulfilled by examining the omen or clue.",
  },
  5: {
    currentSituation: "Record what the informant reveals, how hostile forces close in, and what is now personally threatened.",
    establishedFacts: "Add the useful fact learned from the informant and confirmed information about hostile forces.",
    unresolvedMysteries: "Resolve the exact question answered by the informant and add any narrower question created by that answer.",
    activeThreats: "Add or escalate the antagonist's nearby forces and the threat to the valued thing.",
    relationshipState: "Update only if behavior under pressure changes trust, attraction, or suspicion.",
    openPromises: "Add any protection, warning, or investigative obligation accepted in the scene.",
  },
  6: {
    currentSituation: "Record the retreat, the paused investigation, and the unresolved disagreement between the characters.",
    establishedFacts: "Add only past information openly revealed and concerns supported by observed behavior.",
    unresolvedMysteries: "Preserve plot mysteries unless the argument explicitly resolves one.",
    activeThreats: "Preserve the threats that remain outside the retreat; resolve none merely because the characters escaped.",
    relationshipState: "Replace it with the specific fear, mistrust, concealment, or confrontation now separating the characters.",
    openPromises: "Add an explicit demand, boundary, or unfulfilled assurance; resolve promises directly broken or fulfilled.",
  },
  7: {
    currentSituation: "Record the loss of safety, both characters' commitment, and their shared next step.",
    establishedFacts: "Add confirmed information revealed by the intrusion and each character's stated reason to continue.",
    unresolvedMysteries: "Preserve unanswered plot questions and resolve only those demonstrated during the intrusion.",
    activeThreats: "Escalate the invading hostile force and remove a threat only if it is conclusively stopped.",
    relationshipState: "Replace it with the new level of admiration, trust, and chosen cooperation created by the crisis.",
    openPromises: "Add the characters' commitments to each other and their agreed next action; resolve the refusal-era hesitation.",
  },
  8: {
    currentSituation: "Record the threshold crossed, the guide's warning, and the endangered value driving the journey.",
    establishedFacts: "Add confirmed magical-world rules, the guide's useful interpretation, and the boundary crossed.",
    unresolvedMysteries: "Resolve clues interpreted by the guide and add questions the new world or warning creates.",
    activeThreats: "Add the credible threat to the valued thing and preserve the antagonist's active forces.",
    relationshipState: "Update only if crossing the boundary changes reliance, trust, or romantic tension.",
    openPromises: "Add obligations to the guide, promises to protect the threatened value, and the next destination.",
  },
  9: {
    currentSituation: "Record the test's outcome, its cost, and the new complication created by success.",
    establishedFacts: "Add what the test proves about the world and each character's demonstrated capabilities.",
    unresolvedMysteries: "Resolve any question answered by overcoming the obstacle and add only the complication's unanswered question.",
    activeThreats: "Resolve the path obstacle if fully overcome; add the resulting complication only if it remains dangerous.",
    relationshipState: "Replace it with the trust, admiration, or attraction earned through cooperation.",
    openPromises: "Resolve the immediate promise to pass the obstacle and add any obligation caused by the victory's cost.",
  },
  10: {
    currentSituation: "Record the strained plan, the visible effect of the secret, and where the characters intend to go next.",
    establishedFacts: "Add only what is openly learned; never store the concealed secret as a fact known by both characters.",
    unresolvedMysteries: "Add the partner's unanswered suspicion without revealing the secret; preserve central mysteries.",
    activeThreats: "Preserve external threats during the refuge unless a threat is directly discovered.",
    relationshipState: "Replace it with the new tenderness, attraction, disagreement, and incomplete trust.",
    openPromises: "Add the strained shared plan and any explicit personal assurance; resolve promises completed during recovery.",
  },
  11: {
    currentSituation: "Record the escape location, the broken plan, the loss, and the enemy's immediate advantage.",
    establishedFacts: "Add how the refuge was discovered and what the attack confirms about the enemy's capabilities.",
    unresolvedMysteries: "Resolve how the enemy found them if confirmed and add questions created by the consequential loss.",
    activeThreats: "Escalate the attacking force and preserve it after escape unless a specific component is destroyed.",
    relationshipState: "Update with the effect of courage, rescue, blame, or loss on the partnership.",
    openPromises: "Resolve the failed plan and add obligations created by the escape or lost person, clue, route, or object.",
  },
  12: {
    currentSituation: "Record the characters' lowest point, the final stakes, and their recognition that sacrifice is required.",
    establishedFacts: "Add the confirmed destruction, its significance, and the demonstrated scale of the enemy's power.",
    unresolvedMysteries: "Resolve questions answered by the destruction and preserve only mysteries still relevant to defeating the enemy.",
    activeThreats: "Escalate the final consequence of failure and remove threats conclusively ended during the ordeal.",
    relationshipState: "Replace it with the honesty, distance, renewed reliance, or intimacy produced by shared grief.",
    openPromises: "Add the necessity to stop the final threat and any promise made about the coming sacrifice.",
  },
  13: {
    currentSituation: "Record the antagonist's supported weakness, each character's role, and the complete confrontation plan.",
    establishedFacts: "Add the weakness and evidence supporting it, plus resources secured from the revisited source.",
    unresolvedMysteries: "Resolve the question of how the enemy might be defeated; preserve mysteries not required by the plan.",
    activeThreats: "Preserve the final threat and update only its known limitation or timing.",
    relationshipState: "Update with the trust and intimacy expressed in the tender moment without forcing a final romantic answer.",
    openPromises: "Add every essential commitment in the plan and any personal promise made before confrontation.",
  },
  14: {
    currentSituation: "Record why the original plan failed, what useful information was revealed, and where the characters escape.",
    establishedFacts: "Add the antagonist's demonstrated countermeasure, the exposed character weakness, and the useful revelation.",
    unresolvedMysteries: "Resolve questions answered during confrontation and add the immediate question of how to improvise victory.",
    activeThreats: "Escalate the antagonist's pursuit and remove only plan-specific hazards conclusively escaped or destroyed.",
    relationshipState: "Update with the effect of failure, vulnerability, rescue, or blame on the relationship.",
    openPromises: "Resolve commitments belonging to the failed plan and preserve personal promises that still matter.",
  },
  15: {
    currentSituation: "Record the antagonist's defeat, the central threat's resolution, the victory cost, and the characters' condition.",
    establishedFacts: "Add how the final plan succeeded, each character's indispensable contribution, and the cost paid.",
    unresolvedMysteries: "Resolve the central mystery and every question directly answered by the climax; preserve only genuine aftermath questions.",
    activeThreats: "Resolve the antagonist and stopped central threat by exact memory text; add only a concrete surviving consequence.",
    relationshipState: "Update with the trust and emotional consequence created by the shared victory, leaving the final declaration open.",
    openPromises: "Resolve plan commitments completed in the climax and preserve only promises requiring aftermath or romantic closure.",
  },
  16: {
    currentSituation: "Record the reward, the lasting return cost, the unfinished consequence, and the route home.",
    establishedFacts: "Add what the characters claim or reject and how their priorities have changed since the beginning.",
    unresolvedMysteries: "Resolve aftermath questions answered by the reward and retain only the submitted unfinished consequence if still unknown.",
    activeThreats: "Do not restore the defeated antagonist; add only a non-central consequence that remains genuinely dangerous.",
    relationshipState: "Update with how the characters approach ordinary life together while preserving the unanswered romantic question.",
    openPromises: "Resolve journey obligations completed by returning and preserve only commitments requiring the final conversation.",
  },
  17: {
    currentSituation: "Record the final romantic outcome and the concrete shape of the characters' lives after the story.",
    establishedFacts: "Add the declaration, answer, and final relationship decision as durable facts.",
    unresolvedMysteries: "Resolve remaining relationship uncertainty and any central-story question explicitly closed in the ending.",
    activeThreats: "Preserve only true aftermath consequences; introduce no new threat.",
    relationshipState: "Replace it with the definitive final relationship state, whether joyful, tentative, separate, or bittersweet.",
    openPromises: "Resolve promises answered by the declaration and retain only commitments explicitly carried into the characters' future.",
  },
};

// Selects the only character details included in a scene prompt.
export function characterDetails({ reveal = [], subtext = [] } = {}) {
  const repeatedFields = reveal.filter((field) => subtext.includes(field));

  if (repeatedFields.length) {
    throw new Error(
      `Character details cannot be both revealed and subtext: ${repeatedFields.join(", ")}`
    );
  }

  return { reveal, subtext };
}

export const SCENE_BLUEPRINTS = [
  {
    number: 0,
    name: "Cold Open",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[0],
    playerBrief:
      "A mysterious moment hints at the danger ahead. Choose details that make the mystery feel impossible to ignore.",
    description:
      "Open with a brief teaser in which the active character encounters a concrete sign of the central mystery.",
    narrativeParagraphs: 2,
    beats: [
      "Establish {madlibs.location} as a specific place within {story.setting}.",
      "Introduce {madlibs.intrigue} as a disruption the active character can observe or interact with.",
      "Have {activePlayer.name} respond through a concrete action consistent with their role as {activePlayer.role}.",
      "End with an unanswered implication connected to {story.plot} and {story.antagonist}, without explaining either one.",
    ],
    inputRoles: {
      location: {
        influence: "supporting",
        purpose: "The physical setting where the action occurs.",
      },
      intrigue: {
        influence: "plot-driving",
        purpose: "The disruption that causes the active character to act.",
      },
    },
    tone:
      "The situation feels immediately dangerous or surprising.",
    promptContext: {
      includeRomance: false,
      activePlayer: characterDetails({
        reveal: ["name", "role"],
        subtext: ["gift"],
      }),
      otherPlayer: null,
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: false,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "location",
          label: "Location",
          placeholder: "a garbage-strewn alley, a windswept cliff, a locked room...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "intrigue",
          label: "Something intriguing",
          placeholder: "unknown footprints, a secret letter, a shadowy figure...",
        },
      ],
    },
    constraints: [
      "Create a brief teaser scene, not the full beginning of the plot.",
      "Describe the setting with a few concrete details that affect the action.",
      "Hint at the plot and the antagonist without being explicit.",
      "If a Mad Libs input overlaps with or contradicts established story or character details, subordinate it to the story — use it as a detail within that world, not as a replacement for it.",
      "Do not include a roll-off, choice, or resolved dilemma yet.",
    ],
  },
  {
    number: 1,
    name: "Ordinary World",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[1],
    playerBrief:
      "Meet your character in their ordinary life. Choose details that reveal who they are before the mystery changes everything.",
    description:
      "Show the active character handling an ordinary problem in a way that establishes personality, competence, and life before the adventure.",
    narrativeParagraphs: 1,
    beats: [
      "Place {activePlayer.name}, acting in their role as {activePlayer.role}, in {madlibs.normalEnvironment} while they perform {madlibs.routineAction}.",
      "Have {madlibs.minorNpc} bring {madlibs.smallProblem} into that routine.",
      "Make the active character pursue their immediate objective through a concrete response to the problem.",
      "End with one consequence of that response while keeping {story.plot} and the current situation in the background: {memory.currentSituation}.",
    ],
    inputRoles: {
      normalEnvironment: {
        influence: "supporting",
        purpose: "The familiar setting; it must not become a new plot thread.",
      },
      routineAction: {
        influence: "supporting",
        purpose: "A normal action that reveals how the active character behaves.",
      },
      minorNpc: {
        influence: "supporting",
        purpose: "A temporary scene partner who introduces the immediate problem.",
      },
      smallProblem: {
        influence: "plot-driving",
        purpose: "The immediate obstacle the active character tries to solve.",
      },
    },
    tone:
      "The active character handles an ordinary problem in a way that reveals personality and competence. Let pressure from the larger plot stay in the background. Keep the narration restrained.",
    promptContext: {
      includeRomance: false,
      activePlayer: characterDetails({
        reveal: ["name", "role"],
        subtext: ["goal", "gift"],
      }),
      otherPlayer: null,
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: false,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "normalEnvironment",
          label: "Your characters normal environment",
          placeholder: "a cluttered workshop, a local cafe, a quiet library...",
        },
        {
          key: "routineAction",
          label: "A routine action",
          placeholder: "locks the gate, burns breakfast, rehearses a lie...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "minorNpc",
          label: "A minor character",
          placeholder: "a nosy aunt, a nervous clerk, a street magician...",
        },
        {
          key: "smallProblem",
          label: "A small problem",
          placeholder: "a missing phone, a bad omen, a spilled coffee...",
        },
      ],
    },
    constraints: [
      "The characters should not meet yet.",
      "Do not include a roll-off, choice, or dilemma yet.",
    ],
  },
  {
    number: 2,
    name: "The Meeting",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[2],
    playerBrief:
      "Your characters meet, and something draws them together. Choose details that make the attraction—and the misunderstanding—impossible to miss.",
    description:
      "Bring the two main characters together for the first time and let a specific misunderstanding create an immediate obstacle between them.",
    narrativeParagraphs: 2,
    beats: [
      "Have {activePlayer.name} arrive at {madlibs.meetingPlace} because {madlibs.whyThere} supports their immediate objective.",
      "Give {otherPlayer.name} a simple reason to be there that is compatible with these established facts: {memory.establishedFacts}.",
      "Have one character notice {madlibs.notice}; keep it a concrete observation, not a separate event.",
      "Turn {madlibs.misreadSignal} into an action or remark that causes one character to draw the wrong conclusion about the other.",
      "Have that wrong conclusion provoke a goal-driven response and end with a clear obstacle between them.",
    ],
    inputRoles: {
      meetingPlace: {
        influence: "supporting",
        purpose: "The shared physical setting; it does not create the conflict by itself.",
      },
      whyThere: {
        influence: "plot-driving",
        purpose: "The active character's immediate reason for entering the scene.",
      },
      notice: {
        influence: "supporting",
        purpose: "One concrete observation about the other character.",
      },
      misreadSignal: {
        influence: "plot-driving",
        purpose: "The trigger for a mistaken interpretation and resulting conflict.",
      },
    },
    tone:
      "The characters are awkwardly curious about or attracted to each other and misread the interaction. Express this through dialogue, gestures, and decisions. Keep the narration direct.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "meetingPlace",
          label: "Where they meet",
          placeholder: "a foggy pier, a packed theater, a broken elevator...",
        },
        {
          key: "whyThere",
          label: "Why are you there",
          placeholder: "looking for someone, going to work, trying to be alone...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "notice",
          label: "Something you notice",
          placeholder: "a favoiite song, a unique accent, a familiar book...",
        },
        {
          key: "misreadSignal",
          label: "A misread signal",
          placeholder: "a nervous smile, a bad joke, a shared glance...",
        },
      ],
    },
    constraints: [
      "The characters must meet in this scene.",
      "Create immediate tension, curiosity, or attraction between them.",
      "Do not make either character confess love or trust yet.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 3,
    name: "Inciting Incident",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[3],
    playerBrief:
      "Something impossible intrudes on ordinary life. Choose details that make the mystery urgent, personal, and impossible to explain away.",
    description:
      "Draw both characters into the central mystery by confronting them with an unexpected visitor and evidence that does not belong in their ordinary world.",
    narrativeParagraphs: 2,
    beats: [
      "Have {madlibs.unexpectedVisitor} interrupt the characters and reveal information connected to {story.plot}.",
      "Show {activePlayer.name} reacting through {madlibs.reaction}, pursuing their immediate objective rather than waiting for an explanation.",
      "Introduce {madlibs.mysteriousDetail} as concrete evidence that the threat is real but not yet understood.",
      "Have {otherPlayer.name} ask {madlibs.probingQuestion}; the answer should clarify what is at stake without solving the mystery.",
      "End with the characters aware that {story.antagonist} or its influence is involved and that ignoring the incident will have consequences.",
    ],
    inputRoles: {
      unexpectedVisitor: {
        influence: "plot-driving",
        purpose: "The person or creature who interrupts ordinary life and exposes the central problem.",
      },
      reaction: {
        influence: "supporting",
        purpose: "The active character's immediate behavior when the incident begins.",
      },
      mysteriousDetail: {
        influence: "plot-driving",
        purpose: "The unexplained evidence that proves the incident is connected to a larger mystery.",
      },
      probingQuestion: {
        influence: "supporting",
        purpose: "The question that draws out the most important immediate information.",
      },
    },
    tone:
      "Ordinary life is abruptly disturbed. The characters are confused but alert as the danger becomes credible. Keep the explanation focused on immediate stakes.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "unexpectedVisitor",
          label: "An unexpected character who appears",
          placeholder: "a frightened neighbor, a wounded stranger, a familiar ghost...",
        },
        {
          key: "reaction",
          label: "How your character reacts",
          placeholder: "blocks the door, demands proof, offers help...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "mysteriousDetail",
          label: "A mysterious detail that is out of place",
          placeholder: "an unsigned note, an unlocked door, unknown marks...",
        },
        {
          key: "probingQuestion",
          label: "A question you ask to uncover the truth",
          placeholder: "Who else knows? Why come to us? What happens next?...",
        },
      ],
    },
    constraints: [
      "Connect the incident directly to the central plot.",
      "Explain the immediate stakes without explaining the full mystery or antagonist.",
      "Give both characters a reason to remain involved after the visitor leaves or the interruption ends.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 4,
    name: "Call to Adventure",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[4],
    playerBrief:
      "The mystery points toward danger—and toward you. Choose signs that suggest why your characters may be the only people who can help.",
    description:
      "Turn the inciting incident into a clear opportunity to act by revealing a clue that needs the characters' particular knowledge or abilities.",
    narrativeParagraphs: 2,
    beats: [
      "Return to an established ordinary location and alter it with {madlibs.omen}, making the danger feel closer than it did before.",
      "Show {activePlayer.name} responding through {madlibs.responseToOmen}; let that response affect what the characters notice next.",
      "Reveal {madlibs.clue} as a concrete lead connected to {story.plot} and the unresolved mysteries: {memory.unresolvedMysteries}.",
      "Make {madlibs.neededReason} the practical reason the characters can interpret or pursue the clue when others cannot.",
      "End with a clear next step and a credible warning of danger, but do not force the characters to commit yet.",
    ],
    inputRoles: {
      omen: {
        influence: "plot-driving",
        purpose: "The threatening sign that brings the mystery into an established ordinary location.",
      },
      responseToOmen: {
        influence: "supporting",
        purpose: "The active character's behavior in response to the omen.",
      },
      clue: {
        influence: "plot-driving",
        purpose: "The evidence that gives the characters a specific direction to investigate.",
      },
      neededReason: {
        influence: "supporting",
        purpose: "The established knowledge, role, or ability that makes a character useful to the investigation.",
      },
    },
    tone:
      "The characters recognize that they could help, but the path ahead is unsettling. Keep the danger specific and the next step clear.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "omen",
          label: "A strange and ominous omen",
          placeholder: "dark skies, a watchful crow, a symbol carved into the wall...",
        },
        {
          key: "responseToOmen",
          label: "How the omen affects your character",
          placeholder: "hides their fear, warns their partner, refuses to look away...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "clue",
          label: "A mysterious clue whose meaning is unclear",
          placeholder: "a torn map, a coded message, an impossible photograph...",
        },
        {
          key: "neededReason",
          label: "Why your character is needed to interpret the clue",
          placeholder: "recognizes the language, knows the neighborhood, has seen it before...",
        },
      ],
    },
    constraints: [
      "Build directly on the inciting incident rather than introducing a separate mystery.",
      "Show why the characters are capable of helping without declaring them heroes.",
      "Give the investigation one concrete next step.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 5,
    name: "The Squeeze",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[5],
    playerBrief:
      "You dig deeper and discover that the danger is already close. Choose details that threaten something your characters cannot easily abandon.",
    description:
      "Escalate the investigation by leading the characters to a source of information while the antagonist's forces close in and make the danger personal.",
    narrativeParagraphs: 2,
    beats: [
      "Have the existing clue lead the characters to {madlibs.clueDestination}, where they expect to find useful information.",
      "Introduce {madlibs.informant} as someone who knows part of the truth but has a concrete reason to be cautious.",
      "Show {activePlayer.name} responding to the growing danger through {madlibs.dangerBehavior} while pursuing the needed information.",
      "Use {madlibs.valuedThing} as something genuinely important that {story.antagonist} or its forces can now threaten.",
      "End with proof that hostile forces are nearby and know the characters are investigating.",
    ],
    inputRoles: {
      clueDestination: {
        influence: "plot-driving",
        purpose: "The location where the existing clue leads the investigation.",
      },
      informant: {
        influence: "supporting",
        purpose: "The cautious source who can reveal one useful piece of information.",
      },
      dangerBehavior: {
        influence: "supporting",
        purpose: "The active character's behavior as the investigation becomes threatening.",
      },
      valuedThing: {
        influence: "plot-driving",
        purpose: "The person, place, object, or principle that makes the threat personal.",
      },
    },
    tone:
      "The characters make progress, but every answer increases the pressure. Keep the hostile presence close, credible, and partly unseen.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "want"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "want"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "clueDestination",
          label: "Where the clue leads you",
          placeholder: "an abandoned house, a seedy bar, the mayor's home...",
        },
        {
          key: "informant",
          label: "A character you find there",
          placeholder: "an old hermit, a grizzled cop, a nervous librarian...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "dangerBehavior",
          label: "How your character acts when things become dangerous",
          placeholder: "cracks jokes, checks every exit, takes charge...",
        },
        {
          key: "valuedThing",
          label: "Something your character values",
          placeholder: "a younger sibling, their reputation, a treasured keepsake...",
        },
      ],
    },
    constraints: [
      "Reveal one useful fact about the antagonist or its forces.",
      "Threaten the valued thing without destroying or resolving it in this scene.",
      "Make the escalation follow from the characters' investigation.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 6,
    name: "Refusal",
    act: 1,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[6],
    playerBrief:
      "Now that you have seen the danger, doubt sets in. Choose fears and suspicions that could pull your characters apart—or make honesty unavoidable.",
    description:
      "Let the danger exposed by the investigation drive the characters into retreat, where fear from the past and mistrust between them make continuing uncertain.",
    narrativeParagraphs: 2,
    beats: [
      "Have the characters retreat to {madlibs.retreatLocation} after the threat established in the previous scene.",
      "Let {madlibs.pastFear} shape {activePlayer.name}'s immediate desire to stop, withdraw, or change course.",
      "Use {madlibs.partnerDoubt} as a specific concern about {otherPlayer.name}, grounded in something the characters have actually seen or done.",
      "Have the doubting character express or conceal that concern through {madlibs.revelationMethod}.",
      "End with the investigation paused and the relationship strained, while the active threats remain unresolved: {memory.activeThreats}.",
    ],
    inputRoles: {
      retreatLocation: {
        influence: "supporting",
        purpose: "The place where the characters temporarily withdraw from danger.",
      },
      pastFear: {
        influence: "plot-driving",
        purpose: "The established or plausible fear that motivates hesitation.",
      },
      partnerDoubt: {
        influence: "plot-driving",
        purpose: "The specific concern that creates mistrust between the characters.",
      },
      revelationMethod: {
        influence: "supporting",
        purpose: "The behavior that determines whether and how the concern enters the conversation.",
      },
    },
    tone:
      "Fear replaces momentum. Keep the conflict intimate and specific, with danger still present beyond the temporary retreat.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "retreatLocation",
          label: "Where you retreat after the danger",
          placeholder: "a locked apartment, an empty diner, a childhood hideout...",
        },
        {
          key: "pastFear",
          label: "Something from your past that haunts you now",
          placeholder: "a promise you broke, someone you failed, a warning you ignored...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "partnerDoubt",
          label: "What makes you unsure about the other character",
          placeholder: "they hid evidence, took a reckless risk, seem too eager...",
        },
        {
          key: "revelationMethod",
          label: "How you handle that doubt",
          placeholder: "keep silent, confront them, drop a careful hint...",
        },
      ],
    },
    constraints: [
      "Make the refusal a direct response to the danger established in The Squeeze.",
      "Ground mistrust in prior events rather than inventing a betrayal.",
      "Do not resolve the characters' fear or relationship tension yet.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 7,
    name: "Push/Catalyst",
    act: 2,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[7],
    playerBrief:
      "The danger invades somewhere you thought was safe. Choose the moment that forces your characters to stop hesitating and face the mystery together.",
    description:
      "Force both characters to commit to the adventure by letting the antagonist's forces invade ordinary life and remove the safety of refusal.",
    narrativeParagraphs: 2,
    beats: [
      "Bring the characters to {madlibs.safePlace}, where they expect temporary safety after their refusal.",
      "Have forces connected to {story.antagonist} intrude and turn the established threat into an immediate confrontation.",
      "Show {activePlayer.name} recognizing {madlibs.admiredQuality} in {otherPlayer.name} during the crisis.",
      "Use {madlibs.activeCommitment} as the active character's concrete reason to move forward and {madlibs.otherCommitment} as the other character's separate reason.",
      "End with both characters committed to one shared next step because returning to ordinary life is no longer safe.",
    ],
    inputRoles: {
      safePlace: {
        influence: "plot-driving",
        purpose: "The ordinary location whose loss of safety forces the characters to act.",
      },
      activeCommitment: {
        influence: "plot-driving",
        purpose: "The active character's personal reason for committing to the adventure.",
      },
      admiredQuality: {
        influence: "supporting",
        purpose: "The quality the active character witnesses in their partner during the crisis.",
      },
      otherCommitment: {
        influence: "plot-driving",
        purpose: "The other character's distinct reason for committing to the adventure.",
      },
    },
    tone:
      "The pressure becomes immediate and physical. Courage grows from necessity and from seeing the other character act under threat.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "turnOn", "want"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "turnOn", "want"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "safePlace",
          label: "A place in the ordinary world where you feel safe",
          placeholder: "a family kitchen, a quiet office, a crowded neighborhood bar...",
        },
        {
          key: "activeCommitment",
          label: "Why your character decides to move forward",
          placeholder: "someone needs protection, the threat knows too much, running failed...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "admiredQuality",
          label: "What you admire about your partner in this moment",
          placeholder: "their courage, their quick thinking, their unexpected kindness...",
        },
        {
          key: "otherCommitment",
          label: "Why your character decides to move forward",
          placeholder: "they need answers, they made a promise, their partner cannot go alone...",
        },
      ],
    },
    constraints: [
      "Make this escalation more immediate and dangerous than the Call to Adventure.",
      "Connect the intrusion to existing threats rather than introducing a new enemy.",
      "Give each character an independent reason to commit.",
      "End with a concrete decision to continue together.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 8,
    name: "Crossing the Threshold",
    act: 2,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[8],
    playerBrief:
      "You cross into a world where the old rules no longer hold. Choose what your characters hope to find—and what makes turning back impossible.",
    description:
      "Carry the committed characters into the unfamiliar magical world by transforming a place where they seek answers and revealing a personal cost to failure.",
    narrativeParagraphs: 2,
    beats: [
      "Have the characters follow the established lead to {madlibs.answerLocation} because they expect to find {madlibs.hopedDiscovery}.",
      "Transform the location through the influence of the mysterious world while preserving recognizable details from its ordinary form.",
      "Introduce {madlibs.guide} as someone who can interpret existing clues without solving the central mystery.",
      "Have the guide reveal that {madlibs.threatenedValue} is now under credible threat from {story.antagonist} or its forces.",
      "End with the characters crossing a physical or practical boundary that makes retreat difficult.",
    ],
    inputRoles: {
      answerLocation: {
        influence: "plot-driving",
        purpose: "The destination where the characters expect to find answers.",
      },
      hopedDiscovery: {
        influence: "supporting",
        purpose: "The answer or evidence the characters expect to find there.",
      },
      guide: {
        influence: "supporting",
        purpose: "The person who interprets established clues and explains the threshold.",
      },
      threatenedValue: {
        influence: "plot-driving",
        purpose: "The valued person, place, object, or principle endangered by failure.",
      },
    },
    tone:
      "Familiar surroundings become unreliable. Discovery and danger arrive together as the characters enter the unknown.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift", "want"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift", "want"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "answerLocation",
          label: "A place you go to find answers",
          placeholder: "a sealed archive, an abandoned church, a tunnel beneath town...",
        },
        {
          key: "hopedDiscovery",
          label: "What you hope to find there",
          placeholder: "a missing record, proof of a ritual, the clue's original owner...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "guide",
          label: "A character who can interpret the clues",
          placeholder: "a retired detective, a reluctant medium, a local historian...",
        },
        {
          key: "threatenedValue",
          label: "Something you value that is now under threat",
          placeholder: "your home, a close friend, your freedom, the town itself...",
        },
      ],
    },
    constraints: [
      "Build the transformed location from an established place or existing lead.",
      "Let the guide clarify rules and stakes without delivering a complete solution.",
      "Make crossing the threshold a consequence of the characters' commitment.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 9,
    name: "The Test",
    act: 2,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[9],
    playerBrief:
      "Your first real challenge waits deeper in the mysterious world. Choose an obstacle that can only be overcome by learning how to work together.",
    description:
      "Give the characters their first sustained challenge in the magical world and make success depend on combining their different strengths.",
    narrativeParagraphs: 3,
    beats: [
      "Lead the characters into {madlibs.unknownPlace} as they pursue their current objective.",
      "Block their path with {madlibs.pathObstacle}, making clear why neither character can easily overcome it alone.",
      "Have {activePlayer.name} notice {madlibs.partnerObservation} about {otherPlayer.name} while they assess the obstacle.",
      "Let {otherPlayer.name} perform {madlibs.impressiveAction}, creating an opening that requires the active character's contribution to complete.",
      "End with the obstacle overcome and one new complication or cost created by their success.",
    ],
    inputRoles: {
      unknownPlace: {
        influence: "supporting",
        purpose: "The unfamiliar location where the first trial occurs.",
      },
      pathObstacle: {
        influence: "plot-driving",
        purpose: "The concrete challenge blocking progress toward the current objective.",
      },
      partnerObservation: {
        influence: "supporting",
        purpose: "The useful or revealing quality noticed under pressure.",
      },
      impressiveAction: {
        influence: "plot-driving",
        purpose: "The action that creates an opening but does not solve the test alone.",
      },
    },
    tone:
      "The challenge is dangerous but readable. Competence, improvisation, and growing trust drive the action.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "unknownPlace",
          label: "A new and unknown place you enter",
          placeholder: "a flooded crypt, a moonlit maze, a market that appears at midnight...",
        },
        {
          key: "pathObstacle",
          label: "Something blocking your path",
          placeholder: "a living gate, a suspicious guardian, a bridge that changes shape...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "partnerObservation",
          label: "Something you notice about the other character",
          placeholder: "they stay calm under pressure, recognize a hidden pattern, protect strangers...",
        },
        {
          key: "impressiveAction",
          label: "Something impressive your character does",
          placeholder: "deciphers a warning, distracts the guardian, risks a dangerous crossing...",
        },
      ],
    },
    constraints: [
      "Make the obstacle part of the route toward an established objective.",
      "Require meaningful contributions from both characters.",
      "Show attraction or admiration through observed behavior rather than explanation.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 10,
    name: "The Misunderstanding",
    act: 2,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[10],
    playerBrief:
      "After surviving the test, you finally have a quiet moment together. Choose the secret and disagreement that make closeness feel thrilling—and dangerous.",
    description:
      "Use a quiet recovery after the test to deepen attraction while a secret and conflicting plans expose a flaw in the partnership.",
    narrativeParagraphs: 2,
    beats: [
      "Let the characters recover at {madlibs.restingPlace}, a temporary refuge within the magical world.",
      "Show {activePlayer.name} helping through {madlibs.helpfulAction}, creating a moment of trust or attraction.",
      "Keep {madlibs.secret} concealed, but let one concrete behavior caused by the secret be visible to {otherPlayer.name}.",
      "Introduce {madlibs.commitmentConcern} as the other character's reason for resisting the active character's proposed next step.",
      "End with the characters still together but following a strained or incomplete plan.",
    ],
    inputRoles: {
      helpfulAction: {
        influence: "supporting",
        purpose: "The practical act of care that brings the characters closer.",
      },
      secret: {
        influence: "plot-driving",
        purpose: "The concealed fact that distorts the character's behavior and the shared plan.",
      },
      restingPlace: {
        influence: "supporting",
        purpose: "The temporary refuge where the relationship conversation can occur.",
      },
      commitmentConcern: {
        influence: "plot-driving",
        purpose: "The specific concern that prevents full trust or agreement.",
      },
    },
    tone:
      "Relief creates room for tenderness, but guarded behavior turns attraction into uncertainty. Keep the conflict emotionally specific.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "turnOn", "want"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "turnOn", "want"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "helpfulAction",
          label: "How your character helps in this moment",
          placeholder: "tends an injury, shares supplies, keeps watch while they rest...",
        },
        {
          key: "secret",
          label: "Something your character is keeping secret",
          placeholder: "they recognize the enemy, lost part of the clue, made a private promise...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "restingPlace",
          label: "A place in the mysterious world where you can rest",
          placeholder: "a candlelit waystation, a hidden greenhouse, an abandoned train car...",
        },
        {
          key: "commitmentConcern",
          label: "Why your character cannot fully trust the other yet",
          placeholder: "they avoid direct questions, take reckless risks, seem ready to leave...",
        },
      ],
    },
    constraints: [
      "Build the disagreement from current objectives, prior behavior, and the submitted secret.",
      "Use each character's turn-on only as subtext expressed through behavior.",
      "Do not expose the secret unless the player input explicitly makes concealment impossible.",
      "Do not resolve the romantic tension yet.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 11,
    name: "The Ordeal",
    act: 2,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[11],
    playerBrief:
      "The enemy shatters your quiet moment, and investigation becomes survival. Choose the surprise, courage, and loss that will change your characters.",
    description:
      "Let the antagonist's forces invade the temporary refuge, turning the unresolved relationship tension into a desperate fight for survival.",
    narrativeParagraphs: 3,
    beats: [
      "Reveal that the enemy found the refuge through {madlibs.discoveryMethod}, using established facts whenever possible.",
      "Have the attack begin suddenly and show {otherPlayer.name} reacting first through {madlibs.firstReaction}.",
      "Give {activePlayer.name} courage through {madlibs.sourceOfCourage}, turning fear into one decisive action that helps both characters escape.",
      "Make {madlibs.escapeLoss} the concrete cost of survival and connect that loss to an established objective, clue, or relationship concern.",
      "End after the characters barely escape, with the enemy stronger and their previous plan broken.",
    ],
    inputRoles: {
      discoveryMethod: {
        influence: "plot-driving",
        purpose: "The plausible way hostile forces locate the temporary refuge.",
      },
      sourceOfCourage: {
        influence: "supporting",
        purpose: "The person, memory, realization, or object that enables decisive action.",
      },
      firstReaction: {
        influence: "supporting",
        purpose: "The other character's immediate behavior when the surprise attack begins.",
      },
      escapeLoss: {
        influence: "plot-driving",
        purpose: "The meaningful cost paid during the escape.",
      },
    },
    tone:
      "Survival takes priority over investigation. The attack is fast, disorienting, and costly without becoming gratuitous.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "discoveryMethod",
          label: "How the enemy found you",
          placeholder: "a tracking mark, a betrayed confidence, a clue left behind...",
        },
        {
          key: "sourceOfCourage",
          label: "What gives your character courage",
          placeholder: "their partner is trapped, an old promise, a sudden realization...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "firstReaction",
          label: "Your character's first reaction to the surprise attack",
          placeholder: "pushes their partner to safety, freezes, attacks the nearest threat...",
        },
        {
          key: "escapeLoss",
          label: "Something lost during the escape",
          placeholder: "the map, a trusted ally, a safe route home, a treasured object...",
        },
      ],
    },
    constraints: [
      "Make the attack follow from an established vulnerability or submitted discovery method.",
      "Let survival require action from both characters.",
      "Make the escape loss consequential but not automatically fatal.",
      "The characters must survive and retreat.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 12,
    name: "Dark Night of the Soul",
    act: 2,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[12],
    playerBrief:
      "The cost of failure is impossible to ignore. Choose what was destroyed, what it meant, and why walking away is no longer an option.",
    description:
      "Bring the defeated characters back toward the ordinary world, where they confront the meaning of their loss and discover stakes large enough to demand sacrifice.",
    narrativeParagraphs: 2,
    beats: [
      "Return the characters to a previously established ordinary location where the consequences of the ordeal are visible.",
      "Reveal that {madlibs.destroyedThing} was destroyed or irreversibly changed during the enemy's advance.",
      "Have {activePlayer.name} explain or demonstrate why {madlibs.personalMeaning} makes that loss personally devastating.",
      "Show {otherPlayer.name} reacting to the enemy's increased power through {madlibs.powerReaction}.",
      "Use {madlibs.finalStakes} to define what will happen if the characters fail, then end with them recognizing that victory will require a real sacrifice.",
    ],
    inputRoles: {
      destroyedThing: {
        influence: "plot-driving",
        purpose: "The established or plausible loss that demonstrates the enemy's growing power.",
      },
      personalMeaning: {
        influence: "supporting",
        purpose: "The emotional significance that makes the destruction matter to the active character.",
      },
      powerReaction: {
        influence: "supporting",
        purpose: "The other character's behavior after recognizing the enemy's increased power.",
      },
      finalStakes: {
        influence: "plot-driving",
        purpose: "The concrete consequence that makes defeating the enemy necessary.",
      },
    },
    tone:
      "Exhaustion and grief strip away false confidence. Honesty may bring the characters closer even as the odds worsen.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "destroyedThing",
          label: "Something the enemy destroyed",
          placeholder: "a family home, the town archive, a protective boundary...",
        },
        {
          key: "personalMeaning",
          label: "What that loss meant to your character",
          placeholder: "it held their only happy memories, proved they belonged, kept someone safe...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "powerReaction",
          label: "How your character reacts to the enemy's true power",
          placeholder: "admits they are terrified, searches for a weakness, tries to send their partner away...",
        },
        {
          key: "finalStakes",
          label: "What is at stake if your characters fail",
          placeholder: "the town disappears, someone they love is transformed, the mystery repeats forever...",
        },
      ],
    },
    constraints: [
      "Make every consequence follow from the ordeal and established threat.",
      "Do not erase all hope; reveal why the characters still might succeed together.",
      "Identify the need for sacrifice without deciding its exact form yet.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 13,
    name: "The Plan",
    act: 3,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[13],
    playerBrief:
      "You cannot defeat the enemy head-on. Choose the weakness, insight, and tender moment that turn everything you have learned into one dangerous plan.",
    description:
      "Let the characters recover hope by combining their accumulated knowledge, revisiting an established source, and designing a plan around the antagonist's weakness.",
    narrativeParagraphs: 2,
    beats: [
      "Have the characters revisit an established person or place that contains knowledge or resources needed for a new plan.",
      "Establish {madlibs.enemyWeakness} as a plausible weakness supported by prior clues rather than a new convenient fact.",
      "Show {otherPlayer.name} uncovering the weakness through {madlibs.weaknessDiscovery}.",
      "Use {madlibs.planContribution} as the active character's essential contribution to a plan that exploits the weakness.",
      "Let the characters share {madlibs.tenderMoment} before they leave, then end with a concrete plan and acknowledged risk.",
    ],
    inputRoles: {
      enemyWeakness: {
        influence: "plot-driving",
        purpose: "The exploitable limitation of the antagonist supported by existing evidence.",
      },
      weaknessDiscovery: {
        influence: "supporting",
        purpose: "The action or insight through which the partner identifies the weakness.",
      },
      planContribution: {
        influence: "plot-driving",
        purpose: "The active character's essential contribution to exploiting the weakness.",
      },
      tenderMoment: {
        influence: "supporting",
        purpose: "The brief intimate exchange that raises the emotional stakes before confrontation.",
      },
    },
    tone:
      "Hard-earned understanding restores momentum. The plan feels clever and possible, but never safe.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "enemyWeakness",
          label: "A weakness the enemy might have",
          placeholder: "cannot cross running water, needs an invitation, is bound to a hidden object...",
        },
        {
          key: "weaknessDiscovery",
          label: "How your partner uncovers the weakness",
          placeholder: "connects two clues, questions an old ally, notices a repeated mistake...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "planContribution",
          label: "How your partner helps create the plan",
          placeholder: "offers specialized knowledge, volunteers as bait, finds a hidden route...",
        },
        {
          key: "tenderMoment",
          label: "A tender moment you share before the confrontation",
          placeholder: "an unfinished confession, a quiet promise, a hand held too long...",
        },
      ],
    },
    constraints: [
      "Derive the weakness from prior clues or reinterpret a submitted weakness to fit established continuity.",
      "Give both characters indispensable roles in the plan.",
      "State the plan clearly enough for the next scene to test it.",
      "Do not resolve the romance or defeat the antagonist yet.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 14,
    name: "The Confrontation",
    act: 3,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[14],
    playerBrief:
      "You put the plan into motion—and discover the enemy is ready for it. Choose the surprise, exposed weakness, and desperate escape that leave only Plan B.",
    description:
      "Let the characters attempt their carefully prepared plan against the antagonist, then make it fail through a credible complication that exposes a personal weakness.",
    narrativeParagraphs: 3,
    beats: [
      "Bring the characters to a location consistent with their established plan and begin the first steps exactly as agreed.",
      "Introduce {madlibs.unexpectedEvent} as a complication that follows from the antagonist's knowledge, power, or prior actions.",
      "Have {activePlayer.name} address the antagonist through {madlibs.enemyWords}, using the exchange to reveal useful information rather than pause the action.",
      "Expose {madlibs.exposedWeakness} in one character and let the antagonist exploit it to break the plan.",
      "Use {madlibs.escapeMethod} to get both characters out alive, but end with the original plan impossible to repeat.",
    ],
    inputRoles: {
      unexpectedEvent: {
        influence: "plot-driving",
        purpose: "The credible complication that causes the prepared plan to fail.",
      },
      enemyWords: {
        influence: "supporting",
        purpose: "The words spoken to the antagonist during the confrontation.",
      },
      exposedWeakness: {
        influence: "plot-driving",
        purpose: "The character flaw or vulnerability the antagonist exploits.",
      },
      escapeMethod: {
        influence: "supporting",
        purpose: "The desperate but plausible action that allows both characters to survive.",
      },
    },
    tone:
      "Confidence collapses into improvisation. The antagonist is prepared, personal, and dangerous, but reveals something useful while winning.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "gift", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "unexpectedEvent",
          label: "Something unexpected that ruins the plan",
          placeholder: "the weakness has moved, an ally changes sides, the trap closes too early...",
        },
        {
          key: "enemyWords",
          label: "What your character says to the enemy",
          placeholder: "You chose the wrong town. Tell us where they are. We know what you fear...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "exposedWeakness",
          label: "A weakness your character reveals",
          placeholder: "cannot abandon someone in danger, loses control when frightened, trusts too easily...",
        },
        {
          key: "escapeMethod",
          label: "How your characters escape",
          placeholder: "collapse the passage, steal the enemy's vehicle, leap through an unstable doorway...",
        },
      ],
    },
    constraints: [
      "Follow the plan established in the previous scene before disrupting it.",
      "Make the failure result from established opposition and the submitted complication.",
      "Reveal information that can support a different final strategy.",
      "Both characters must survive, and the antagonist must remain undefeated.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 15,
    name: "Climax",
    act: 3,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[15],
    playerBrief:
      "The first plan is gone, the enemy is closing in, and there is no time left. Choose the desperate new idea that only your characters can complete together.",
    description:
      "Drive the characters into a final confrontation where they improvise a new plan from everything they have learned and defeat the antagonist through cooperation.",
    narrativeParagraphs: 3,
    beats: [
      "Have the antagonist pursue the characters back toward an established ordinary-world location tied to the story's beginning.",
      "Let {activePlayer.name} propose {madlibs.newPlan} using the useful information revealed when the original plan failed.",
      "Make {madlibs.requiredAction} the dangerous central action the new plan requires.",
      "Use {madlibs.partnerContribution} as {otherPlayer.name}'s indispensable contribution, allowing the active character's different strength to complete the plan.",
      "Make the victory require {madlibs.victoryCost}, and show both characters understanding what they are giving up.",
      "End with {story.antagonist} decisively defeated or contained, the central threat stopped, and one unresolved personal or romantic consequence remaining.",
    ],
    inputRoles: {
      newPlan: {
        influence: "plot-driving",
        purpose: "The improvised final strategy built from established discoveries and the failed plan.",
      },
      requiredAction: {
        influence: "plot-driving",
        purpose: "The dangerous action necessary to make the final strategy work.",
      },
      partnerContribution: {
        influence: "plot-driving",
        purpose: "The other character's indispensable contribution to the shared victory.",
      },
      victoryCost: {
        influence: "supporting",
        purpose: "The personal cost or sacrifice that prevents the victory from feeling effortless.",
      },
    },
    tone:
      "Urgency demands trust and improvisation. The victory is decisive, cooperative, and costly enough to feel earned.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "role", "gift", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "newPlan",
          label: "A desperate new plan",
          placeholder: "turn the enemy's trap against them, expose them publicly, sever the source of their power...",
        },
        {
          key: "requiredAction",
          label: "What must be done to make the plan work",
          placeholder: "hold the doorway open, retrieve the lost clue, lure the enemy into position...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "partnerContribution",
          label: "How your character makes victory possible",
          placeholder: "deciphers the final symbol, distracts the enemy, refuses to leave their partner...",
        },
        {
          key: "victoryCost",
          label: "What victory costs your characters",
          placeholder: "a treasured power, their safe old life, a chance to learn the whole truth...",
        },
      ],
    },
    constraints: [
      "Build the new plan from established clues, abilities, locations, and the confrontation's revelation.",
      "Use {madlibs.victoryCost} as a real sacrifice or consequence during the victory.",
      "Require essential action from both characters.",
      "Resolve the central external threat without resolving the final romantic question.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 16,
    name: "The Road Back",
    act: 3,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[16],
    playerBrief:
      "The enemy is defeated, but the journey home reveals one unfinished piece of the mystery. Choose the reward worth carrying forward—and the cost that still follows you.",
    description:
      "Let the characters leave the defeated threat behind, claim a meaningful reward, and discover one unfinished consequence that carries into ordinary life.",
    narrativeParagraphs: 2,
    beats: [
      "Lead the characters through {madlibs.rewardLocation}, a new part of the magical world made accessible by their victory.",
      "Reveal {madlibs.hopedReward} as something they believed they wanted, then test whether it still matters after the journey.",
      "Introduce {madlibs.unfinishedConsequence} as a consequence of the victory rather than a new antagonist or unrelated mystery.",
      "Have the characters accept {madlibs.returnCost} as the price of bringing the reward or hard-earned knowledge home.",
      "End with the characters returning toward an established ordinary-world location together.",
    ],
    inputRoles: {
      rewardLocation: {
        influence: "supporting",
        purpose: "The final magical-world location where the reward or missing piece is found.",
      },
      hopedReward: {
        influence: "plot-driving",
        purpose: "The reward the characters once believed would make the struggle worthwhile.",
      },
      unfinishedConsequence: {
        influence: "plot-driving",
        purpose: "The remaining consequence of victory that must be carried into the ending.",
      },
      returnCost: {
        influence: "supporting",
        purpose: "The lasting price of returning with the reward or knowledge.",
      },
    },
    tone:
      "Relief mixes with exhaustion and reflection. Victory is real, but returning home does not erase what changed.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "rewardLocation",
          label: "A final place in the mysterious world",
          placeholder: "the enemy's hidden garden, a chamber beneath the town, a shore seen only at dawn...",
        },
        {
          key: "hopedReward",
          label: "What your character hoped to gain from the journey",
          placeholder: "the missing truth, restored honor, a cure, proof they were right...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "unfinishedConsequence",
          label: "Something the victory did not completely fix",
          placeholder: "the magic still marks them, an ally remains missing, part of the truth is lost...",
        },
        {
          key: "returnCost",
          label: "What your characters must leave behind or accept",
          placeholder: "their old anonymity, a magical gift, the certainty they once had...",
        },
      ],
    },
    constraints: [
      "Treat the antagonist as defeated and do not restart the central conflict.",
      "Make the unfinished consequence follow directly from the climax.",
      "Show how each character's priorities have changed since the Ordinary World.",
      "Preserve the final romantic question for The Declaration.",
      "Do not include a roll-off or choice yet.",
    ],
  },
  {
    number: 17,
    name: "The Declaration",
    act: 3,
    type: "madlibs_scene",
    memoryUpdates: SCENE_MEMORY_UPDATES[17],
    playerBrief:
      "Back where your story began, one question remains: what do you mean to each other now? Choose the fear, gesture, and answer that decide whether this is love—or something bittersweet.",
    description:
      "Return the characters to an established ordinary-world location and resolve the romantic arc through an honest declaration, a final fear, and a meaningful response.",
    narrativeParagraphs: 2,
    beats: [
      "Bring the characters to {madlibs.returnLocation}, an established place whose meaning has changed since the beginning.",
      "Have {activePlayer.name} make {madlibs.declarationGesture}, expressing what they want from {otherPlayer.name} through words and action.",
      "Let {madlibs.finalFear} create one last credible obstacle rooted in the relationship's established history.",
      "Have {otherPlayer.name} give {madlibs.declarationAnswer}, making the response specific and emotionally honest.",
      "End with a clear romantic outcome and one concrete image of how the characters' ordinary lives will be different together or apart.",
    ],
    inputRoles: {
      returnLocation: {
        influence: "supporting",
        purpose: "The established ordinary-world location that frames the changed relationship.",
      },
      declarationGesture: {
        influence: "plot-driving",
        purpose: "The words and action through which the active character reveals their feelings.",
      },
      finalFear: {
        influence: "plot-driving",
        purpose: "The last relationship-based fear that must be faced before an answer is possible.",
      },
      declarationAnswer: {
        influence: "plot-driving",
        purpose: "The other character's specific response that determines the romantic ending.",
      },
    },
    tone:
      "The danger has passed, leaving room for direct emotional honesty. The ending may be joyful or bittersweet, but it must feel earned.",
    promptContext: {
      includeRomance: true,
      activePlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
      otherPlayer: characterDetails({
        reveal: ["name"],
        subtext: ["goal", "want", "turnOn"],
      }),
    },
    rules: {
      ...DEFAULT_MADLIB_RULES,
      charactersMeet: true,
    },
    madLibs: {
      activePlayerPrompts: [
        {
          key: "returnLocation",
          label: "A place from earlier in the story you return to",
          placeholder: "the cafe where you argued, the pier where you met, the repaired family kitchen...",
        },
        {
          key: "declarationGesture",
          label: "How your character reveals their feelings",
          placeholder: "asks them to stay, returns a treasured object, finally says what they were afraid to admit...",
        },
      ],
      otherPlayerPrompts: [
        {
          key: "finalFear",
          label: "The last fear standing between your characters",
          placeholder: "being abandoned, losing their independence, repeating an old mistake...",
        },
        {
          key: "declarationAnswer",
          label: "How your character answers the declaration",
          placeholder: "chooses a life together, asks for time but stays, admits they want something different...",
        },
      ],
    },
    constraints: [
      "Resolve the romantic arc using the established relationship state and prior emotional changes.",
      "Honor the submitted answer even when it creates a bittersweet ending.",
      "Do not introduce a new external threat or unresolved central mystery.",
      "End the complete story rather than setting up another scene.",
      "Do not include a roll-off or choice.",
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
