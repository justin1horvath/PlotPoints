// Builds the full scene prompt from reusable game state plus a scene blueprint.
export function buildScenePrompt({
  activePlayer,
  blueprint,
  players,
  storyDirection,
  storyLog,
  madLibsText,
}) {
  return `Write Scene ${blueprint.number} for Plot Point, a two-player romantic storytelling RPG. Write plainly. Use only details provided in the prompt — do not invent atmosphere, imagery, or adjectives to fill space. Prefer short, concrete sentences over poetic or literary ones. If a detail was not given, leave it out.

STORY CONTEXT
${formatStoryContext(storyDirection, blueprint.promptContext?.story)}

SCENE BLUEPRINT
Scene name: ${blueprint.name}
Act: ${blueprint.act}
Description: ${blueprint.description}
Tone: ${blueprint.tone}

SCENE CONSTRAINTS
${formatList(blueprint.constraints)}

ACTIVE PLAYER
Player ${activePlayer} is the active player for this scene.

CHARACTERS
${formatPlayers(players, activePlayer, blueprint.promptContext?.characters)}

STORY SO FAR
${formatStoryLog(storyLog)}

PLAYER MAD LIBS
${madLibsText}

OUTPUT REQUIREMENTS
Return valid JSON only. No markdown.
Use strict JSON: double-quoted property names and strings, no comments, and no trailing commas.
Inside string values, do not use double quote characters. Use apostrophes or rewrite the sentence instead.

Speak in the present tense, first person. From the point of view of the active player.
Focus on action. Showing, not telling. Use active descriptions of character actions and dialogue to reveal who they are, what they want, and how they feel.
The narrative should be 2 short paragraphs meant to be read aloud.
Return location and goals as structured fields, but also weave the location and both character goals naturally into the narrative text. 
In paragraph one, set the scene, why the character or characters are there, and what they want.
In paragraph two, set up an obstacle to what they want. Do not resolve the obstacle yet; just create tension and stakes around it.
The storyLogEntry should be compact memory for future scenes, not prose for players.`;
}

// Formats only the story direction fields that the current scene is allowed to use.
function formatStoryContext(storyDirection, storyContext = {}) {
  if (!storyDirection) {
    return "No story direction provided.";
  }

  const revealText = formatSelectedFields(
    "Reveal and use directly",
    storyDirection,
    storyContext.reveal,
    STORY_DIRECTION_LABELS
  );
  const hintText = formatSelectedFields(
    "Hint at, but do not explain",
    storyDirection,
    storyContext.hint,
    STORY_DIRECTION_LABELS
  );
  const subtextText = formatSelectedFields(
    "Use as subtext only",
    storyDirection,
    storyContext.subtext,
    STORY_DIRECTION_LABELS
  );

  return [
    revealText,
    hintText,
    subtextText,
    "Do not name, explain, reveal, or foreshadow omitted story context.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Formats the campaign-level continuity settings that should guide every scene.
export function formatStoryDirection(storyDirection) {
  if (!storyDirection) {
    return "Use the default Plot Point romance adventure tone.";
  }

  return `Genre: ${storyDirection.genre}
Setting: ${storyDirection.setting}
Antagonist: ${storyDirection.antagonist}
Plot: ${storyDirection.plot}
Romance dynamic: ${storyDirection.romanceDynamic}`;
}

// Formats active-player and other-player character data with separate controls.
function formatPlayers(players, activePlayerNumber, characterContext = {}) {
  const activePlayer = getPlayerByNumber(players, activePlayerNumber);
  const otherPlayer = getOtherPlayer(players, activePlayerNumber);
  const activeText = formatActivePlayerInfo(activePlayer, characterContext.active || {});
  const otherText = formatOtherPlayerInfo(otherPlayer, characterContext.other || {});

  if (!activeText && !otherText) {
    return [
      "No character details are available to this scene.",
      "Do not invent, name, explain, reveal, or foreshadow omitted private character details.",
    ].join("\n\n");
  }

  return [
    activeText,
    otherText,
    "Do not invent, name, explain, reveal, or foreshadow omitted private character details.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Formats only the active player's allowed character details.
function formatActivePlayerInfo(player, characterContext = {}) {
  if (!player) {
    return "";
  }

  return formatCharacterContextForPlayer("Active player character context", player, characterContext);
}

// Formats only the non-active player's allowed character details.
function formatOtherPlayerInfo(player, characterContext = {}) {
  if (!player) {
    return "";
  }

  return formatCharacterContextForPlayer("Other player character context", player, characterContext);
}

// Formats reveal, hint, and subtext lanes for one player.
function formatCharacterContextForPlayer(heading, player, characterContext = {}) {
  const revealFields = characterContext.reveal || [];
  const hintFields = characterContext.hint || [];
  const subtextFields = characterContext.subtext || [];

  if (!revealFields.length && !hintFields.length && !subtextFields.length) {
    return "";
  }

  const body = [
    formatPlayerFields("Reveal and use directly", player, revealFields),
    formatPlayerFields("Hint at, but do not explain", player, hintFields),
    formatPlayerFields("Use as subtext only", player, subtextFields),
  ]
    .filter(Boolean)
    .join("\n\n");

  return `${heading}:\n${body}`;
}

// Formats compact previous-scene memory for future scene continuity.
function formatStoryLog(storyLog) {
  if (!storyLog.length) {
    return "No completed scenes yet.";
  }

  return storyLog
    .map((entry) => {
      return `Scene ${entry.scene}: ${entry.title}
Summary: ${entry.summary}
Emotional shift: ${entry.emotionalShift}
Unresolved threads: ${entry.unresolvedThreads.join("; ")}
Important facts: ${entry.importantFacts.join("; ")}
Romance beat: ${entry.romanceBeat}`;
    })
    .join("\n\n");
}

// Formats a plain-English list for the prompt.
function formatList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

// Formats selected object fields under one prompt heading.
function formatSelectedFields(heading, source, keys = [], labels = {}) {
  const lines = keys
    .filter((key) => source[key])
    .map((key) => `${labels[key] || key}: ${source[key]}`);

  if (!lines.length) {
    return "";
  }

  return `${heading}:\n${lines.join("\n")}`;
}

// Formats selected character fields for one player under one prompt heading.
function formatPlayerFields(heading, player, keys = []) {
  const lines = keys
    .map((key) => formatPlayerField(player, key))
    .filter(Boolean);

  if (!lines.length) {
    return "";
  }

  return `${heading}:\nPlayer ${player.number}:\n${lines.join("\n")}`;
}

// Converts one character field key into the text sent to the model.
function formatPlayerField(player, key) {
  const formatters = {
    name: () => `Name: ${player.name}`,
    role: () => `Job/role: ${player.answers.role}`,
    gift: () => `Gift: ${player.answers.gift}`,
    physicalDetail: () => `Physical detail: ${player.physicalDetail}`,
    stats: () =>
      `Stats: Guts ${player.stats.guts}, Charm ${player.stats.charm}, Wit ${player.stats.wit}, Heart ${player.stats.heart}`,
    turnOn: () => `Private turn on: ${player.answers.turnOn}`,
    want: () => `Private want: ${player.answers.want}`,
  };

  return formatters[key]?.() || "";
}

// Finds a player by their player number.
function getPlayerByNumber(players, playerNumber) {
  return players.find((player) => player.number === playerNumber);
}

// Finds the non-active player in the current two-player scene.
function getOtherPlayer(players, activePlayerNumber) {
  return players.find((player) => player.number !== activePlayerNumber);
}

const STORY_DIRECTION_LABELS = {
  genre: "Genre",
  setting: "Setting",
  antagonist: "Antagonist",
  plot: "Plot",
  romanceDynamic: "Romance dynamic",
};
