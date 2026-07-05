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

  return `Write Scene ${blueprint.number} for Plot Point, a romantic storytelling RPG.
Write plainly. Use the details provided in the scene description and story so far. Prefer short, concrete sentences over poetic or literary ones. If a detail is not needed to meet the story needs, leave it out.
Modify any detail in the scene task, tense, and voice as needed to fit the story so far, but do not change the scene's core narrative function.

SCENE TASK
Scene name: ${blueprint.name}
Act: ${blueprint.act}
Task: ${resolveSceneDescription({
  description: blueprint.description,
  activePlayer,
  activePlayerData,
  otherPlayerData,
  storyDirection,
  madLibs,
})}
Tone: ${blueprint.tone}

SCENE CONSTRAINTS
${formatList(blueprint.constraints)}

ACTIVE PLAYER
Player ${activePlayer} is the active player for this scene.

STORY SO FAR
${formatStoryLog(storyLog)}

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
  storyDirection,
  madLibs,
}) {
  const values = createDescriptionVariableMap({
    activePlayer,
    activePlayerData,
    otherPlayerData,
    storyDirection,
    madLibs,
  });

  return description.replace(/\{([^}]+)\}/g, (match, rawKey) => {
    const key = rawKey.trim();
    return values[key] ?? match;
  });
}

// Creates the variable names that scene descriptions can reference.
function createDescriptionVariableMap({
  activePlayer,
  activePlayerData,
  otherPlayerData,
  storyDirection,
  madLibs,
}) {
  return {
    ...prefixValues("story", storyDirection),
    ...prefixValues("madlibs", madLibs),
    ...prefixValues("activePlayer", formatPlayerVariables(activePlayerData)),
    ...prefixValues("otherPlayer", formatPlayerVariables(otherPlayerData)),
    activePlayer: `Player ${activePlayer}`,
  };
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

// Finds a player by their player number.
function getPlayerByNumber(players, playerNumber) {
  return players.find((player) => player.number === playerNumber);
}

// Finds the non-active player in the current two-player scene.
function getOtherPlayer(players, activePlayerNumber) {
  return players.find((player) => player.number !== activePlayerNumber);
}
