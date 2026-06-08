import { loadSavedGameState, resetState, state } from "./state.js";
import {
  renderPhase,
  renderScoreboard,
  renderSceneMadLibs,
  renderSceneReveal,
} from "./scenes.js";
import {
  renderCharacterQuestion,
  renderCharacterReveal,
  startCharacterCreation,
} from "./characters.js";
import { downloadAiLog } from "./aiLog.js";

// Starts a fresh game and moves immediately into private character creation.
function onStartNewStory() {
  resetState();
  startCharacterCreation();
}

// Connects page buttons to JavaScript functions after the HTML has loaded.
function attachEventListeners() {
  const button = document.getElementById("start-story-button");
  if (button) {
    button.addEventListener("click", onStartNewStory);
  }

  const downloadAiLogButton = document.getElementById("download-ai-log-button");
  if (downloadAiLogButton) {
    downloadAiLogButton.addEventListener("click", downloadAiLog);
  }
}

// Sets up the first visible page state when the browser opens the app.
function initializeApp() {
  const restoredGame = loadSavedGameState();

  renderPhase();
  renderScoreboard();
  attachEventListeners();

  if (restoredGame) {
    renderRestoredScreen();
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);

// Rebuilds the visible screen after a browser reload restores saved state.
function renderRestoredScreen() {
  if (state.phase === "Character Creation") {
    renderCharacterQuestion();
    return;
  }

  if (state.phase === "Generating Characters") {
    renderCharacterQuestion();
    return;
  }

  if (state.phase === "Characters Ready") {
    renderCharacterReveal();
    return;
  }

  if (state.scenePhase === "madlibs_active") {
    renderSceneMadLibs(state.currentSceneData.inputOrder?.[0] || state.activePlayer);
    return;
  }

  if (state.scenePhase === "madlibs_other") {
    renderSceneMadLibs(state.currentSceneData.inputOrder?.[1] || getOtherPlayerNumber());
    return;
  }

  if (state.scenePhase === "generating") {
    renderSceneMadLibs(state.currentSceneData.inputOrder?.[1] || getOtherPlayerNumber());
    return;
  }

  if (state.scenePhase === "reveal") {
    renderSceneReveal();
  }
}

// Returns the non-active player number in a two-player game.
function getOtherPlayerNumber() {
  return state.activePlayer === 1 ? 2 : 1;
}
