// Builds the full scene prompt from reusable game state plus a scene blueprint.
export function buildScenePrompt({
  activePlayer,
  blueprint,
  players,
  storyLog,
  madLibsText,
}) {
  return `Write Scene ${blueprint.number} for Plot Point, a two-player romantic storytelling RPG.

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
${formatPlayers(players)}

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

// Formats private and public character data for the AI prompt.
function formatPlayers(players) {
  return players
    .map((player) => {
      return `Player ${player.number}: ${player.name}
Role: ${player.answers.role}
Gift: ${player.answers.gift}
Physical detail: ${player.physicalDetail}
Stats: Guts ${player.stats.guts}, Charm ${player.stats.charm}, Wit ${player.stats.wit}, Heart ${player.stats.heart}
Private turn on: ${player.answers.turnOn}
Private want: ${player.answers.want}`;
    })
    .join("\n\n");
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
