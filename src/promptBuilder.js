// Builds the full scene prompt from reusable game state plus a scene blueprint.
export function buildScenePrompt({ blueprint, players, storyLog, madLibsText }) {
  return `Write Scene ${blueprint.number} for Plot Point, a two-player romantic storytelling RPG.

SCENE BLUEPRINT
Scene name: ${blueprint.name}
Act: ${blueprint.act}
Description: ${blueprint.description}
Tone: ${blueprint.tone}

SCENE CONSTRAINTS
${formatList(blueprint.constraints)}

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
The narrative should be 3 to 5 short paragraphs meant to be read aloud.
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
