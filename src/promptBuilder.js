// Builds the full scene prompt from reusable game state plus a scene blueprint.
export function buildScenePrompt({
  activePlayer,
  blueprint,
  players,
  storyDirection,
  storyLog,
  madLibs = {},
}) {
  const activePlayerData = getPlayerByNumber(players, activePlayer);
  const otherPlayerData = getOtherPlayer(players, activePlayer);

  return `Write Scene ${blueprint.number} for Plot Point, a two-player romantic storytelling RPG.
Write plainly. Use the details provided in the scene task. Prefer short, concrete sentences over poetic or literary ones. If a detail is not needed to meet the story needs, leave it out.
Modify any detail in the scene task, tense, and voice as needed to fit prior memory, but do not change the scene's core narrative function.

SCENE TASK
Scene name: ${blueprint.name}
Act: ${blueprint.act}
Task: ${resolveSceneDescription({
  description: blueprint.description,
  activePlayer,
  activePlayerData,
  otherPlayerData,
  storyLog,
  storyDirection,
  madLibs,
})}
Tone: ${blueprint.tone}

SCENE CONSTRAINTS
${formatList(blueprint.constraints)}

ACTIVE PLAYER
Player ${activePlayer} is the active player for this scene.

OUTPUT REQUIREMENTS
Return valid JSON only. No markdown.
Use strict JSON: double-quoted property names and strings, no comments, and no trailing commas.
Inside string values, do not use double quote characters. Use apostrophes or rewrite the sentence instead.

Speak in the present tense, first person. From the point of view of the active player.
Focus on action. Showing, not telling. Use active descriptions of character actions and dialogue to reveal who they are, what they want, and how they feel.
The narrative should be 2 short paragraphs meant to be read aloud.
Return location and goals as structured fields, but also weave the location and both character goals naturally into the narrative text.
The goals.player1 and goals.player2 fields should rewrite each character's current goal after this scene. Keep each goal compact, specific, and updated to reflect how that character's arc has developed. Do not append old goals.
In paragraph one, set the scene, why the character or characters are there, and what they want.
In paragraph two, set up an obstacle to what they want. Do not resolve the obstacle yet; just create tension and stakes around it.
The storyLogEntry should be compact memory for future scenes, not prose for players.`;
}

// Replaces blueprint description tokens with the exact values for this scene.
function resolveSceneDescription({
  description,
  activePlayer,
  activePlayerData,
  otherPlayerData,
  storyLog,
  storyDirection,
  madLibs,
}) {
  const values = createDescriptionVariableMap({
    activePlayer,
    activePlayerData,
    otherPlayerData,
    storyLog,
    storyDirection,
    madLibs,
  });

  const resolvedDescription = description.replace(/\{([^}]+)\}/g, (match, rawKey) => {
    const key = rawKey.trim();
    return values[key] ?? match;
  });
  const unresolvedTokens = resolvedDescription.match(/\{[^}]+\}/g);

  if (unresolvedTokens) {
    throw new Error(
      `Scene description has unresolved variables: ${unresolvedTokens.join(", ")}`
    );
  }

  return resolvedDescription;
}

// Creates the variable names that scene descriptions can reference.
function createDescriptionVariableMap({
  activePlayer,
  activePlayerData,
  otherPlayerData,
  storyLog,
  storyDirection,
  madLibs,
}) {
  return {
    ...prefixValues("story", storyDirection),
    ...prefixValues("memory", formatMemoryVariables(storyLog)),
    ...prefixValues("madlibs", madLibs),
    ...prefixValues("activePlayer", formatPlayerVariables(activePlayerData)),
    ...prefixValues("otherPlayer", formatPlayerVariables(otherPlayerData)),
    activePlayer: `Player ${activePlayer}`,
  };
}

// Converts the latest prior story log entry into description-template variables.
function formatMemoryVariables(storyLog = []) {
  const latestMemory = storyLog.at(-1);

  if (!latestMemory) {
    return {
      summary: "no prior scene summary yet",
      emotionalShift: "no prior emotional shift yet",
      unresolvedThreads: "no prior unresolved threads yet",
      importantFacts: "no prior important facts yet",
      romanceBeat: "no prior romance beat yet",
    };
  }

  return {
    summary: latestMemory.summary,
    emotionalShift: latestMemory.emotionalShift,
    unresolvedThreads: formatMemoryList(latestMemory.unresolvedThreads),
    importantFacts: formatMemoryList(latestMemory.importantFacts),
    romanceBeat: latestMemory.romanceBeat,
  };
}

// Joins AI-generated memory arrays into a compact prompt phrase.
function formatMemoryList(items = []) {
  if (!items.length) {
    return "none";
  }

  return items.join("; ");
}

// Adds a prefix to flat values so descriptions can use names like story.setting.
function prefixValues(prefix, source = {}) {
  return Object.fromEntries(
    Object.entries(source || {}).map(([key, value]) => [`${prefix}.${key}`, value])
  );
}

// Converts one player object into description-template variables.
function formatPlayerVariables(player) {
  if (!player) {
    return {};
  }

  return {
    name: player.name,
    role: player.answers.role,
    gift: player.answers.gift,
    physicalDetail: player.physicalDetail,
    goal: player.goal,
    stats: `Guts ${player.stats.guts}, Charm ${player.stats.charm}, Wit ${player.stats.wit}, Heart ${player.stats.heart}`,
    turnOn: player.answers.turnOn,
    want: player.answers.want,
  };
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

// Formats a plain-English list for the prompt.
function formatList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

// Finds a player by their player number.
function getPlayerByNumber(players, playerNumber) {
  return players.find((player) => player.number === playerNumber);
}

// Finds the non-active player in the current two-player scene.
function getOtherPlayer(players, activePlayerNumber) {
  return players.find((player) => player.number !== activePlayerNumber);
}
