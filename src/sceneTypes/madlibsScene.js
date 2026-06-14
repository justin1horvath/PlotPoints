import { callAI } from "../ai.js";
import { buildScenePrompt } from "../promptBuilder.js";
import { getNextSceneNumber } from "../sceneBlueprints.js";
import { getInactivePlayerNumber, saveGameState, state } from "../state.js";
import { renderPhase } from "../ui.js";

const SCENE_MAX_OUTPUT_TOKENS = 6000;

// Starts a scene that collects private Mad Libs before AI generation.
export function startMadLibsScene(blueprint) {
  const madLibAssignments = createMadLibAssignments(blueprint);
  const inputOrder = [state.activePlayer, getInactivePlayerNumber()];

  state.currentScene = blueprint.number;
  state.scenePhase = "madlibs_active";
  state.phase = `Scene ${blueprint.number} Mad Libs`;
  state.currentSceneData = createSceneDataFromBlueprint(
    blueprint,
    madLibAssignments,
    inputOrder
  );
  renderPhase();
  saveGameState();
  renderMadLibsSceneInput(inputOrder[0]);
}

// Draws the private Mad Libs form for one player.
export function renderMadLibsSceneInput(playerNumber) {
  const panel = getGamePanel();
  const scene = state.currentSceneData;
  const inputs = scene.madLibsInputs[`player${playerNumber}`];
  const assignedFields = getAssignedMadLibFields(playerNumber);
  const inputOrder = getMadLibInputOrder();
  const isActivePlayer = playerNumber === state.activePlayer;
  const turnLabel = isActivePlayer ? "Active player first" : "Second player";

  panel.innerHTML = `
    <div class="screen-kicker">Scene ${scene.blueprint.number} private Mad Libs</div>
    <h2>Player ${playerNumber}, add ingredients</h2>
    <p class="screen-helper">${turnLabel}. Answer your ${assignedFields.length} prompts. They will be woven into the scene, and the other player should not see them.</p>
    <form id="mad-libs-form" class="mad-libs-form">
      ${assignedFields.map((field) => renderMadLibField(field, inputs)).join("")}
      <div class="form-footer">
        <span>Input ${inputOrder.indexOf(playerNumber) + 1} of ${inputOrder.length}</span>
        <button class="action-button" type="submit">Save Inputs</button>
      </div>
    </form>
  `;

  document.querySelector(".short-entry")?.focus();
  document
    .getElementById("mad-libs-form")
    ?.addEventListener("input", (event) => {
      // Saves each field as it changes so private inputs survive a reload.
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

// Shows the generated scene on the shared screen for both players.
export function renderMadLibsSceneReveal() {
  const panel = getGamePanel();
  const scene = state.currentSceneData;
  const blueprint = scene.blueprint;

  panel.innerHTML = `
    <div class="screen-kicker">Scene ${blueprint.number} · ${escapeHtml(blueprint.name)}</div>
    <h2>${escapeHtml(scene.title)}</h2>
    <p class="screen-helper">Player ${state.activePlayer}, read this scene aloud.</p>
    <div class="scene-text">
      ${renderParagraphs(scene.narrative)}
    </div>
    <button id="scene-complete-button" class="action-button" type="button">Scene Complete</button>
  `;

  document
    .getElementById("scene-complete-button")
    ?.addEventListener("click", () => {
      // Marks the reveal as finished and offers the next scene when available.
      const nextSceneNumber = getNextSceneNumber(blueprint.number);
      state.phase = `Scene ${blueprint.number} Complete`;
      state.scenePhase = "complete";
      renderPhase();
      saveGameState();
      panel.innerHTML = `
        <div class="screen-kicker">Scene ${blueprint.number} complete</div>
        <h2>${escapeHtml(blueprint.name)} is set.</h2>
        <p class="screen-helper">${getSceneCompleteMessage(nextSceneNumber)}</p>
        ${renderNextSceneButton(nextSceneNumber)}
      `;
      document
        .getElementById("next-scene-button")
        ?.addEventListener("click", () => startNextScene(nextSceneNumber));
    });
}

// Creates fresh scene state from the current blueprint.
function createSceneDataFromBlueprint(blueprint, madLibAssignments, inputOrder) {
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
    inputOrder,
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

  const inputOrder = getMadLibInputOrder();
  const currentInputIndex = inputOrder.indexOf(playerNumber);
  const nextPlayerNumber = inputOrder[currentInputIndex + 1];

  if (nextPlayerNumber) {
    state.scenePhase = "madlibs_other";
    saveGameState();
    showScenePassScreen(`Hand the device to Player ${nextPlayerNumber}.`, () => {
      // Shows the second player's private Mad Libs after the pass screen.
      renderMadLibsSceneInput(nextPlayerNumber);
    });
    return;
  }

  generateMadLibsScene();
}

// Explains what happens after a scene is marked complete.
function getSceneCompleteMessage(nextSceneNumber) {
  if (nextSceneNumber === null) {
    return "Act 1 test scenes are complete.";
  }

  return `Continue to Scene ${nextSceneNumber} when both players are ready.`;
}

// Builds the continue button only when another test scene exists.
function renderNextSceneButton(nextSceneNumber) {
  if (nextSceneNumber === null) {
    return "";
  }

  return `<button id="next-scene-button" class="action-button" type="button">Start Scene ${nextSceneNumber}</button>`;
}

// Starts the next scene through the central scene router.
async function startNextScene(nextSceneNumber) {
  if (nextSceneNumber === null) {
    return;
  }

  const { startScene } = await import("../scenes.js");
  startScene(nextSceneNumber);
}

// Returns the saved Mad Lib input order, defaulting to active player first.
function getMadLibInputOrder() {
  if (state.currentSceneData.inputOrder?.length) {
    return state.currentSceneData.inputOrder;
  }

  return [state.activePlayer, getInactivePlayerNumber()];
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
async function generateMadLibsScene() {
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
    updateCharacterGoals(sceneData);
    addSceneToStoryLog(blueprint, sceneData);
    state.scenePhase = "reveal";
    state.phase = `Scene ${blueprint.number} Reveal`;
    renderPhase();
    saveGameState();
    renderMadLibsSceneReveal();
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
      ?.addEventListener("click", generateMadLibsScene);
  }
}

// Requests validated scene data from the Worker.
async function requestSceneData(blueprint) {
  return callAI("generate_scene", {
    prompt: buildScenePrompt({
      activePlayer: state.activePlayer,
      blueprint,
      players: state.players,
      storyDirection: state.storyDirection,
      storyLog: state.storyLog,
      madLibs: buildMadLibsPromptValues(),
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

// Rewrites each character's current goal from the AI's latest scene response.
function updateCharacterGoals(sceneData) {
  state.players[0].goal = sceneData.goals.player1;
  state.players[1].goal = sceneData.goals.player2;
}

// Randomly assigns Mad Lib prompt types using the blueprint's rules.
function createMadLibAssignments(blueprint) {
  if (blueprint.rules.madLibAssignment !== "split_random") {
    throw new Error(`Unsupported Mad Lib assignment: ${blueprint.rules.madLibAssignment}`);
  }

  const promptsPerPlayer = blueprint.rules.promptsPerPlayer;
  const totalNeeded = promptsPerPlayer * 2;
  const requiredFields = getRequiredMadLibFields(blueprint);

  if (requiredFields.length > totalNeeded) {
    throw new Error(
      `Scene ${blueprint.number} references ${requiredFields.length} Mad Lib prompts in its description, but only collects ${totalNeeded}.`
    );
  }

  const remainingFields = blueprint.madLibs.promptPool.filter(
    (field) => !requiredFields.some((requiredField) => requiredField.key === field.key)
  );
  const selectedFields = [
    ...requiredFields,
    ...shuffleArray(remainingFields).slice(0, totalNeeded - requiredFields.length),
  ];

  if (selectedFields.length < totalNeeded) {
    throw new Error(
      `Scene ${blueprint.number} needs at least ${totalNeeded} Mad Lib prompts.`
    );
  }

  const shuffledFields = shuffleArray(selectedFields);

  return {
    player1: shuffledFields.slice(0, promptsPerPlayer).map((field) => field.key),
    player2: shuffledFields
      .slice(promptsPerPlayer, promptsPerPlayer * 2)
      .map((field) => field.key),
  };
}

// Finds Mad Lib prompt definitions that are referenced directly by the scene description.
function getRequiredMadLibFields(blueprint) {
  const requiredKeys = getMadLibKeysFromDescription(blueprint.description);

  return requiredKeys.map((key) => {
    const field = blueprint.madLibs.promptPool.find((promptField) => promptField.key === key);

    if (!field) {
      throw new Error(`Scene ${blueprint.number} references unknown Mad Lib key: ${key}`);
    }

    return field;
  });
}

// Extracts every {madlibs.key} placeholder from a scene description.
function getMadLibKeysFromDescription(description) {
  return [...description.matchAll(/\{madlibs\.([^}]+)\}/g)].map((match) =>
    match[1].trim()
  );
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

// Builds keyed Mad Lib values so scene descriptions can reference exact inputs.
function buildMadLibsPromptValues() {
  return [1, 2].reduce((values, playerNumber) => {
    return {
      ...values,
      ...getPlayerMadLibValues(playerNumber),
    };
  }, {});
}

// Returns one player's answered Mad Libs as key/value pairs.
function getPlayerMadLibValues(playerNumber) {
  const inputs = state.currentSceneData.madLibsInputs[`player${playerNumber}`];

  return Object.fromEntries(
    getAssignedMadLibFields(playerNumber).map((field) => [
      field.key,
      inputs[field.key],
    ])
  );
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
