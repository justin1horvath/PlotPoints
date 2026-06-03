import { resetState, state } from "./state.js";
import { renderPhase, renderScoreboard } from "./scenes.js";
import { startCharacterCreation } from "./characters.js";

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
}

// Sets up the first visible page state when the browser opens the app.
function initializeApp() {
  renderPhase();
  renderScoreboard();
  attachEventListeners();
}

document.addEventListener("DOMContentLoaded", initializeApp);
