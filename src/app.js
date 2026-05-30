import { resetState, state } from "./state.js";
import { renderPhase, renderScoreboard } from "./scenes.js";
import { getAIReply } from "./ai.js";

const startButton = document.createElement("button");

function onStartNewStory() {
  resetState();
  state.phase = "Opening Scene";
  renderPhase();
  renderScoreboard();

  getAIReply("Start the story")
    .then((response) => {
      console.log("AI stub response:", response);
    })
    .catch((error) => {
      console.error("AI stub error:", error);
    });
}

function attachEventListeners() {
  const button = document.getElementById("start-story-button");
  if (button) {
    button.addEventListener("click", onStartNewStory);
  }
}

function initializeApp() {
  renderPhase();
  renderScoreboard();
  attachEventListeners();
}

document.addEventListener("DOMContentLoaded", initializeApp);
