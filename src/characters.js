import { callAI } from "./ai.js";
import { saveGameState, state } from "./state.js";
import { renderPhase, renderScoreboard, startFirstScene } from "./scenes.js";

const CHARACTER_QUESTIONS = [
  {
    key: "role",
    label: "What do you do?",
    helper: "Your character's job, role, or title in this world.",
  },
  {
    key: "gift",
    label: "What is your gift?",
    helper: "The one thing you can do that almost no one else can.",
  },
  {
    key: "turnOn",
    label: "What is your turn on?",
    helper: "Something you find irresistible.",
  },
  {
    key: "want",
    label: "What do you want more than anything?",
    helper: "Not from the quest. From your life.",
  },
];

// Resets character creation progress and shows Player 1's first private question.
export function startCharacterCreation() {
  state.phase = "Character Creation";
  state.characterCreation.currentPlayer = 1;
  state.characterCreation.questionIndex = 0;
  state.characterCreation.isComplete = false;
  renderPhase();
  renderScoreboard();
  saveGameState();
  renderCharacterQuestion();
}

// Draws the current player's current question into the main game panel.
export function renderCharacterQuestion() {
  const panel = getGamePanel();
  const player = getCurrentPlayer();
  const question = CHARACTER_QUESTIONS[state.characterCreation.questionIndex];
  const questionNumber = state.characterCreation.questionIndex + 1;

  panel.innerHTML = `
    <div class="screen-kicker">Player ${player.number} private setup</div>
    <h2>${question.label}</h2>
    <p class="screen-helper">${question.helper}</p>
    <form id="character-question-form" class="character-form">
      <label class="sr-only" for="character-answer">${question.label}</label>
      <textarea
        id="character-answer"
        class="text-entry"
        rows="5"
        maxlength="240"
        required
        autocomplete="off"
      >${escapeHtml(player.answers[question.key])}</textarea>
      <div class="form-footer">
        <span>Question ${questionNumber} of ${CHARACTER_QUESTIONS.length}</span>
        <button class="action-button" type="submit">Continue</button>
      </div>
    </form>
  `;

  const textarea = document.getElementById("character-answer");
  textarea?.focus();
  textarea?.addEventListener("input", () => {
    player.answers[question.key] = textarea.value;
    saveGameState();
  });

  document
    .getElementById("character-question-form")
    ?.addEventListener("submit", onCharacterAnswerSubmit);
}

// Saves one answer, then advances to the next question, pass screen, or AI generation.
function onCharacterAnswerSubmit(event) {
  event.preventDefault();

  const player = getCurrentPlayer();
  const question = CHARACTER_QUESTIONS[state.characterCreation.questionIndex];
  const answerInput = document.getElementById("character-answer");
  const answer = answerInput.value.trim();

  if (!answer) {
    answerInput.focus();
    return;
  }

  player.answers[question.key] = answer;
  saveGameState();

  const isLastQuestion =
    state.characterCreation.questionIndex === CHARACTER_QUESTIONS.length - 1;

  if (!isLastQuestion) {
    state.characterCreation.questionIndex += 1;
    saveGameState();
    renderCharacterQuestion();
    return;
  }

  if (state.characterCreation.currentPlayer === 1) {
    showPassScreen("Hand the device to Player 2.", () => {
      state.characterCreation.currentPlayer = 2;
      state.characterCreation.questionIndex = 0;
      saveGameState();
      renderCharacterQuestion();
    });
    return;
  }

  state.characterCreation.isComplete = true;
  saveGameState();
  generateCharacterDetails();
}

// Clears the screen between private inputs so players do not see each other's answers.
function showPassScreen(message, onConfirm) {
  const panel = getGamePanel();
  panel.innerHTML = `
    <div class="pass-screen">
      <div class="screen-kicker">Private answers saved</div>
      <h2>${message}</h2>
      <p class="screen-helper">The screen is cleared before the next private input.</p>
      <button id="pass-confirm-button" class="action-button" type="button">Ready</button>
    </div>
  `;

  document
    .getElementById("pass-confirm-button")
    ?.addEventListener("click", onConfirm);
}

// Sends both players' answers to the Worker and stores generated names/details/stats.
async function generateCharacterDetails() {
  state.phase = "Generating Characters";
  renderPhase();
  saveGameState();

  const panel = getGamePanel();
  panel.innerHTML = `
    <div class="screen-kicker">AI Game Master</div>
    <h2>Creating characters...</h2>
    <p class="screen-helper">The AI Game Master is generating names, physical details, and stats.</p>
  `;

  try {
    const characterData = await requestCharacterData();
    applyGeneratedCharacters(characterData);
    state.phase = "Characters Ready";
    renderPhase();
    saveGameState();
    renderCharacterReveal();
  } catch (error) {
    console.error("Character generation failed:", error);
    panel.innerHTML = `
      <div class="screen-kicker">AI Game Master</div>
      <h2>Character generation failed</h2>
      <p class="screen-helper">${escapeHtml(error.message)}</p>
      <button id="retry-character-generation" class="action-button" type="button">Try Again</button>
    `;
    document
      .getElementById("retry-character-generation")
      ?.addEventListener("click", generateCharacterDetails);
  }
}

// Requests generated character data from the Worker.
async function requestCharacterData() {
  return callAI("generate_character", {
    prompt: buildCharacterPrompt(),
    maxOutputTokens: 1500,
  });
}

// Builds the exact character generation prompt sent to OpenAI.
function buildCharacterPrompt() {
  const playerSummaries = state.players
    .map((player) => {
      return `Player ${player.number}
Role: ${player.answers.role}
Gift: ${player.answers.gift}
Turn on: ${player.answers.turnOn}
Want: ${player.answers.want}`;
    })
    .join("\n\n");

  return `Generate starting character details for Plot Point, a two-player romantic storytelling RPG.

Do not write portraits yet.
Do not reveal the turn on or want directly.
Return valid JSON only. No markdown.
Use strict JSON: double-quoted property names and strings, no comments, and no trailing commas.
Inside string values, do not use double quote characters. Use apostrophes or rewrite the sentence instead.

Each player must receive:
- name: a fitting character name
- physicalDetail: one visible detail that hints at how they carry themselves
- stats: exactly one stat at 2, exactly two stats at 3, exactly one stat at 4

Stats must use these lowercase keys only: guts, charm, wit, heart.

JSON shape:
{
  "players": [
    {
      "number": 1,
      "name": "",
      "physicalDetail": "",
      "stats": { "guts": 0, "charm": 0, "wit": 0, "heart": 0 }
    },
    {
      "number": 2,
      "name": "",
      "physicalDetail": "",
      "stats": { "guts": 0, "charm": 0, "wit": 0, "heart": 0 }
    }
  ]
}

Private character answers:
${playerSummaries}`;
}

// Copies generated character details into the shared game state object.
function applyGeneratedCharacters(characterData) {
  characterData.players.forEach((generatedPlayer) => {
    const player = state.players[generatedPlayer.number - 1];
    player.name = generatedPlayer.name;
    player.physicalDetail = generatedPlayer.physicalDetail;
    player.stats = {
      guts: generatedPlayer.stats.guts,
      charm: generatedPlayer.stats.charm,
      wit: generatedPlayer.stats.wit,
      heart: generatedPlayer.stats.heart,
    };
  });
}

// Shows both players the generated character summaries after private setup is complete.
export function renderCharacterReveal() {
  const panel = getGamePanel();
  panel.innerHTML = `
    <div class="screen-kicker">Characters ready</div>
    <h2>Meet the leads</h2>
    <div class="character-grid">
      ${state.players.map(renderCharacterCard).join("")}
    </div>
    <button id="begin-story-button" class="action-button" type="button">Begin the Story</button>
  `;

  document
    .getElementById("begin-story-button")
    ?.addEventListener("click", () => {
      state.phase = "Starting Scene 0";
      renderPhase();
      saveGameState();
      startFirstScene();
    });
}

// Builds the HTML for one generated character summary card.
function renderCharacterCard(player) {
  return `
    <article class="character-card">
      <div class="screen-kicker">Player ${player.number}</div>
      <h3>${escapeHtml(player.name)}</h3>
      <p>${escapeHtml(player.physicalDetail)}</p>
      <dl class="stat-list">
        <div><dt>Guts</dt><dd>${player.stats.guts}</dd></div>
        <div><dt>Charm</dt><dd>${player.stats.charm}</dd></div>
        <div><dt>Wit</dt><dd>${player.stats.wit}</dd></div>
        <div><dt>Heart</dt><dd>${player.stats.heart}</dd></div>
      </dl>
    </article>
  `;
}

// Returns the player object whose private questions are currently being shown.
function getCurrentPlayer() {
  return state.players[state.characterCreation.currentPlayer - 1];
}

// Finds the main panel where the active game screen is rendered.
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
