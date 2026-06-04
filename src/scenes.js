import { saveGameState, state } from "./state.js";
import { callAI } from "./ai.js";
import { getSceneBlueprint } from "./sceneBlueprints.js";
import { buildScenePrompt } from "./promptBuilder.js";

const SCENE_MAX_OUTPUT_TOKENS = 6000;

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

// Compatibility wrapper for the current character creation flow.
export function startFirstScene() {
  startScene(1);
}

// Starts the correct reusable scene flow for a blueprint.
export function startScene(sceneNumber) {
  const blueprint = getSceneBlueprint(sceneNumber);

  switch (blueprint.type) {
    case "madlibs_scene":
      startMadLibsScene(blueprint);
      break;
    default:
      throw new Error(`Unsupported scene type: ${blueprint.type}`);
  }
}

// Starts a scene that collects private Mad Libs before AI generation.
function startMadLibsScene(blueprint) {
  const madLibAssignments = createMadLibAssignments(blueprint);

  state.currentScene = blueprint.number;
  state.scenePhase = "madlibs_p1";
  state.phase = `Scene ${blueprint.number} Mad Libs`;
  state.currentSceneData = createSceneDataFromBlueprint(
    blueprint,
    madLibAssignments
  );
  renderPhase();
  saveGameState();
  renderSceneMadLibs(1);
}

// Creates fresh scene state from the current blueprint.
function createSceneDataFromBlueprint(blueprint, madLibAssignments) {
  return {
    blueprint,
    title: "",
    location: "",
    setup: "",
    goals: {
      player1: "",
      player2: "",
    },
    madLibsInputs: createMadLibInputState(blueprint),
    assignedMadLibFields: madLibAssignments,
    narrative: "",
    storyLogEntry: null,
  };
}

// Creates blank Mad Lib answer storage for every prompt in the blueprint pool.
function createMadLibInputState(blueprint) {
  const blankAnswers = Object.fromEntries(
    blueprint.madLibs.promptPool.map((field) => [field.key, ""])
  );

  return {
    player1: { ...blankAnswers },
    player2: { ...blankAnswers },
  };
}

// Draws the private Mad Libs form for one player.
export function renderSceneMadLibs(playerNumber) {
  const panel = getGamePanel();
  const scene = state.currentSceneData;
  const inputs = scene.madLibsInputs[`player${playerNumber}`];
  const assignedFields = getAssignedMadLibFields(playerNumber);

  panel.innerHTML = `
    <div class="screen-kicker">Scene ${scene.blueprint.number} private Mad Libs</div>
    <h2>Player ${playerNumber}, add ingredients</h2>
    <p class="screen-helper">Answer your ${assignedFields.length} prompts. They will be woven into the scene, and the other player should not see them.</p>
    <form id="mad-libs-form" class="mad-libs-form">
      ${assignedFields.map((field) => renderMadLibField(field, inputs)).join("")}
      <div class="form-footer">
        <span>${assignedFields.length} private prompts</span>
        <button class="action-button" type="submit">Save Inputs</button>
      </div>
    </form>
  `;

  document.querySelector(".short-entry")?.focus();
  document
    .getElementById("mad-libs-form")
    ?.addEventListener("input", (event) => {
      if (!event.target.matches("input")) {
        return;
      }

      inputs[event.target.name] = event.target.value;
      saveGameState();
    });
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

// Saves one player's Mad Libs and either passes the device or generates the scene.
function onMadLibsSubmit(event, playerNumber) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const inputs = state.currentSceneData.madLibsInputs[`player${playerNumber}`];
  const assignedFields = getAssignedMadLibFields(playerNumber);

  assignedFields.forEach((field) => {
    inputs[field.key] = String(formData.get(field.key) || "").trim();
  });
  saveGameState();

  if (playerNumber === 1) {
    state.scenePhase = "madlibs_p2";
    saveGameState();
    showScenePassScreen("Hand the device to Player 2.", () => {
      renderSceneMadLibs(2);
    });
    return;
  }

  generateCurrentScene();
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

// Sends current scene context to the Worker and stores the generated scene.
async function generateCurrentScene() {
  const blueprint = state.currentSceneData.blueprint;
  state.scenePhase = "generating";
  state.phase = `Generating Scene ${blueprint.number}`;
  renderPhase();
  saveGameState();

  const panel = getGamePanel();
  panel.innerHTML = `
    <div class="screen-kicker">AI Game Master</div>
    <h2>Writing Scene ${blueprint.number}...</h2>
    <p class="screen-helper">The AI Game Master is weaving both players' inputs into ${escapeHtml(blueprint.name)}.</p>
  `;

  try {
    const sceneData = await requestSceneData(blueprint);
    state.currentSceneData = {
      ...state.currentSceneData,
      ...sceneData,
    };
    addSceneToStoryLog(blueprint, sceneData);
    state.scenePhase = "reveal";
    state.phase = `Scene ${blueprint.number} Reveal`;
    renderPhase();
    saveGameState();
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
      ?.addEventListener("click", generateCurrentScene);
  }
}

// Requests validated scene data from the Worker.
async function requestSceneData(blueprint) {
  return callAI("generate_scene", {
    prompt: buildScenePrompt({
      blueprint,
      players: state.players,
      storyLog: state.storyLog,
      madLibsText: buildMadLibsPromptText(),
    }),
    maxOutputTokens: SCENE_MAX_OUTPUT_TOKENS,
  });
}

// Stores compact scene memory for future prompts.
function addSceneToStoryLog(blueprint, sceneData) {
  state.storyLog.push({
    scene: blueprint.number,
    sceneName: blueprint.name,
    title: sceneData.title,
    ...sceneData.storyLogEntry,
    mechanicalResult: {
      winner: null,
      romanceScoreChange: 0,
      plotPointAwardedTo: null,
    },
  });
}

// Randomly assigns Mad Lib prompt types using the blueprint's rules.
function createMadLibAssignments(blueprint) {
  if (blueprint.rules.madLibAssignment !== "split_random") {
    throw new Error(`Unsupported Mad Lib assignment: ${blueprint.rules.madLibAssignment}`);
  }

  const promptsPerPlayer = blueprint.rules.promptsPerPlayer;
  const totalNeeded = promptsPerPlayer * 2;

  if (blueprint.madLibs.promptPool.length < totalNeeded) {
    throw new Error(
      `Scene ${blueprint.number} needs at least ${totalNeeded} Mad Lib prompts.`
    );
  }

  const shuffledFields = shuffleArray(blueprint.madLibs.promptPool);

  return {
    player1: shuffledFields.slice(0, promptsPerPlayer).map((field) => field.key),
    player2: shuffledFields
      .slice(promptsPerPlayer, promptsPerPlayer * 2)
      .map((field) => field.key),
  };
}

// Returns the prompt definitions assigned to one player for this scene.
function getAssignedMadLibFields(playerNumber) {
  const blueprint = state.currentSceneData.blueprint;
  const assignedKeys =
    state.currentSceneData.assignedMadLibFields?.[`player${playerNumber}`] ||
    [];

  return assignedKeys
    .map((key) => blueprint.madLibs.promptPool.find((field) => field.key === key))
    .filter(Boolean);
}

// Formats both players' answered Mad Libs for the scene prompt.
function buildMadLibsPromptText() {
  return [1, 2]
    .map((playerNumber) => {
      return `Player ${playerNumber} Mad Libs:
${formatPlayerMadLibs(playerNumber)}`;
    })
    .join("\n\n");
}

// Formats one player's answered Mad Libs for the scene prompt.
function formatPlayerMadLibs(playerNumber) {
  const inputs = state.currentSceneData.madLibsInputs[`player${playerNumber}`];

  return getAssignedMadLibFields(playerNumber)
    .map((field) => `${field.label}: ${inputs[field.key]}`)
    .join("\n");
}

// Returns a shuffled copy of an array without changing the original.
function shuffleArray(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

// Shows the generated scene on the shared screen for both players.
export function renderSceneReveal() {
  const panel = getGamePanel();
  const scene = state.currentSceneData;
  const blueprint = scene.blueprint;

  panel.innerHTML = `
    <div class="screen-kicker">Scene ${blueprint.number} · ${escapeHtml(blueprint.name)}</div>
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
      state.phase = `Scene ${blueprint.number} Complete`;
      state.scenePhase = "complete";
      renderPhase();
      saveGameState();
      panel.innerHTML = `
        <div class="screen-kicker">Scene ${blueprint.number} complete</div>
        <h2>${escapeHtml(blueprint.name)} is set.</h2>
        <p class="screen-helper">Next scene flow comes next.</p>
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
