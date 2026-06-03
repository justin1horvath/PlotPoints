import { state } from "./state.js";
import { callAI } from "./ai.js";

const MAD_LIB_FIELDS = [
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
];

// Updates the small phase label so players know where they are in the flow.
export function renderPhase() {
  const phaseDisplay = document.getElementById("phase-display");
  if (phaseDisplay) {
    phaseDisplay.textContent = `Current phase: ${state.phase}`;
  }
}

// Copies the current score values from state into the visible scoreboard.
export function renderScoreboard() {
  const romanceScore = document.getElementById("romance-score");
  const player1Points = document.getElementById("player1-points");
  const player2Points = document.getElementById("player2-points");

  if (romanceScore) {
    romanceScore.textContent = String(state.romanceScore);
  }

  if (player1Points) {
    player1Points.textContent = String(state.player1Points);
  }

  if (player2Points) {
    player2Points.textContent = String(state.player2Points);
  }
}

// Begins Scene 1 and asks Player 1 for private Mad Libs inputs.
export function startFirstScene() {
  state.currentScene = 1;
  state.scenePhase = "madlibs_p1";
  state.phase = "Scene 1 Mad Libs";
  state.currentSceneData = {
    title: "",
    location: "",
    setup: "",
    goals: {
      player1: "",
      player2: "",
    },
    madLibsInputs: {
      player1: { word: "", npc: "", action: "", funny: "" },
      player2: { word: "", npc: "", action: "", funny: "" },
    },
    narrative: "",
    storyLogEntry: null,
  };
  renderPhase();
  renderSceneMadLibs(1);
}

// Draws the private Mad Libs form for one player.
function renderSceneMadLibs(playerNumber) {
  const panel = getGamePanel();
  const inputs = state.currentSceneData.madLibsInputs[`player${playerNumber}`];

  panel.innerHTML = `
    <div class="screen-kicker">Scene 1 private Mad Libs</div>
    <h2>Player ${playerNumber}, add ingredients</h2>
    <p class="screen-helper">These will be woven into the first scene. The other player should not see your answers.</p>
    <form id="mad-libs-form" class="mad-libs-form">
      ${MAD_LIB_FIELDS.map((field) => renderMadLibField(field, inputs)).join("")}
      <div class="form-footer">
        <span>Player ${playerNumber} of 2</span>
        <button class="action-button" type="submit">Save Inputs</button>
      </div>
    </form>
  `;

  document.querySelector(".short-entry")?.focus();
  document
    .getElementById("mad-libs-form")
    ?.addEventListener("submit", (event) => onMadLibsSubmit(event, playerNumber));
}

// Builds one text input row for a Mad Libs prompt.
function renderMadLibField(field, inputs) {
  return `
    <label class="field-label">
      <span>${field.label}</span>
      <input
        class="short-entry"
        name="${field.key}"
        value="${escapeHtml(inputs[field.key])}"
        placeholder="${field.placeholder}"
        maxlength="80"
        required
        autocomplete="off"
      />
    </label>
  `;
}

// Saves one player's Mad Libs and either passes the device or generates Scene 1.
function onMadLibsSubmit(event, playerNumber) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const inputs = state.currentSceneData.madLibsInputs[`player${playerNumber}`];

  MAD_LIB_FIELDS.forEach((field) => {
    inputs[field.key] = String(formData.get(field.key) || "").trim();
  });

  if (playerNumber === 1) {
    state.scenePhase = "madlibs_p2";
    showScenePassScreen("Hand the device to Player 2.", () => {
      renderSceneMadLibs(2);
    });
    return;
  }

  generateFirstScene();
}

// Clears private inputs before the next player receives the device.
function showScenePassScreen(message, onConfirm) {
  const panel = getGamePanel();
  panel.innerHTML = `
    <div class="pass-screen">
      <div class="screen-kicker">Mad Libs saved</div>
      <h2>${message}</h2>
      <p class="screen-helper">The screen is cleared before the next player enters private words.</p>
      <button id="scene-pass-confirm-button" class="action-button" type="button">Ready</button>
    </div>
  `;

  document
    .getElementById("scene-pass-confirm-button")
    ?.addEventListener("click", onConfirm);
}

// Sends characters plus Mad Libs to the Worker and stores the generated first scene.
async function generateFirstScene() {
  state.scenePhase = "generating";
  state.phase = "Generating Scene 1";
  renderPhase();

  const panel = getGamePanel();
  panel.innerHTML = `
    <div class="screen-kicker">AI Game Master</div>
    <h2>Writing Scene 1...</h2>
    <p class="screen-helper">The AI Game Master is weaving both players' Mad Libs into the Ordinary World.</p>
  `;

  try {
    const sceneData = await requestFirstSceneData();
    state.currentSceneData = {
      ...state.currentSceneData,
      ...sceneData,
    };
    state.storyLog.push({
      scene: 1,
      sceneName: "Ordinary World",
      title: sceneData.title,
      ...sceneData.storyLogEntry,
      mechanicalResult: {
        winner: null,
        romanceScoreChange: 0,
        plotPointAwardedTo: null,
      },
    });
    state.scenePhase = "reveal";
    state.phase = "Scene 1 Reveal";
    renderPhase();
    renderSceneReveal();
  } catch (error) {
    console.error("Scene generation failed:", error);
    panel.innerHTML = `
      <div class="screen-kicker">AI Game Master</div>
      <h2>Scene generation failed</h2>
      <p class="screen-helper">${escapeHtml(error.message)}</p>
      <button id="retry-scene-generation" class="action-button" type="button">Try Again</button>
    `;
    document
      .getElementById("retry-scene-generation")
      ?.addEventListener("click", generateFirstScene);
  }
}

// Requests validated Scene 1 data from the Worker.
async function requestFirstSceneData() {
  return callAI("generate_scene", {
    prompt: buildFirstScenePrompt(),
    maxOutputTokens: 3000,
  });
}

// Builds the exact prompt that asks OpenAI to create Scene 1.
function buildFirstScenePrompt() {
  const playerText = state.players
    .map((player) => {
      return `Player ${player.number}: ${player.name}
Role: ${player.answers.role}
Gift: ${player.answers.gift}
Physical detail: ${player.physicalDetail}
Stats: Guts ${player.stats.guts}, Charm ${player.stats.charm}, Wit ${player.stats.wit}, Heart ${player.stats.heart}
Private wound: ${player.answers.wound}
Private want: ${player.answers.want}`;
    })
    .join("\n\n");

  const madLibs = [1, 2]
    .map((playerNumber) => {
      const inputs = state.currentSceneData.madLibsInputs[`player${playerNumber}`];
      return `Player ${playerNumber} Mad Libs:
Word: ${inputs.word}
NPC: ${inputs.npc}
Action: ${inputs.action}
Something funny: ${inputs.funny}`;
    })
    .join("\n\n");

  return `Write Scene 1 for Plot Point, a two-player romantic storytelling RPG.

Scene 1 is "Ordinary World." It should show who each character is before they know each other.
The characters should not meet yet.
Tone: playful, vivid, emotionally observant, with a hint of longing.
Use all eight Mad Libs inputs naturally.
Do not reveal either private wound or private want directly; only imply them.
Do not include a roll-off, choice, or dilemma yet.
Return valid JSON only. No markdown.
Use strict JSON: double-quoted property names and strings, no comments, and no trailing commas.
Inside string values, do not use double quote characters. Use apostrophes or rewrite the sentence instead.

JSON shape:
{
  "title": "",
  "location": "",
  "setup": "",
  "goals": {
    "player1": "",
    "player2": ""
  },
  "narrative": "",
  "storyLogEntry": {
    "summary": "",
    "emotionalShift": "",
    "unresolvedThreads": [],
    "importantFacts": [],
    "romanceBeat": ""
  }
}

The narrative should be 3 to 5 short paragraphs meant to be read aloud.
The storyLogEntry should be compact memory for future scenes, not prose for players.

Characters:
${playerText}

Mad Libs:
${madLibs}`;
}

// Shows the first generated scene on the shared screen for both players.
function renderSceneReveal() {
  const panel = getGamePanel();
  const scene = state.currentSceneData;

  panel.innerHTML = `
    <div class="screen-kicker">Scene 1 · Ordinary World</div>
    <h2>${escapeHtml(scene.title)}</h2>
    <div class="scene-meta">
      <div><span>Location</span>${escapeHtml(scene.location)}</div>
      <div><span>${escapeHtml(state.players[0].name)}</span>${escapeHtml(scene.goals.player1)}</div>
      <div><span>${escapeHtml(state.players[1].name)}</span>${escapeHtml(scene.goals.player2)}</div>
    </div>
    <div class="scene-text">
      ${renderParagraphs(scene.narrative)}
    </div>
    <button id="scene-complete-button" class="action-button" type="button">Scene Complete</button>
  `;

  document
    .getElementById("scene-complete-button")
    ?.addEventListener("click", () => {
      state.phase = "Scene 1 Complete";
      state.scenePhase = "complete";
      renderPhase();
      panel.innerHTML = `
        <div class="screen-kicker">Scene 1 complete</div>
        <h2>The Ordinary World is set.</h2>
        <p class="screen-helper">Next up: Scene 2, The Meeting.</p>
      `;
    });
}

// Splits generated scene text into safe HTML paragraphs.
function renderParagraphs(text) {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

// Finds the main panel where the active scene screen is rendered.
function getGamePanel() {
  const panel = document.getElementById("game-panel");
  if (!panel) {
    throw new Error("Game panel not found.");
  }
  return panel;
}

// Escapes player and AI text before placing it into HTML.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
