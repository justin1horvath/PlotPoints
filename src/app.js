import { resetState, state } from "./state.js";
import { renderPhase, renderScoreboard } from "./scenes.js";
import { getAIReply } from "./ai.js";

function onStartNewStory() {
  resetState();
  state.phase = "Opening Scene";
  renderPhase();
  renderScoreboard();

  const aiOutput = document.getElementById("ai-test-output");
  if (aiOutput) {
    aiOutput.textContent = "Testing OpenAI connection...";
  }

  getAIReply("Reply with one short sentence welcoming players to Plot Point.")
    .then((response) => {
      console.log("AI stub response:", response);
      if (aiOutput) {
        aiOutput.textContent = response;
      }
    })
    .catch((error) => {
      console.error("AI error:", error);
      if (aiOutput) {
        aiOutput.textContent = `AI connection failed: ${error.message}`;
      }
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
