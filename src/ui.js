import { state } from "./state.js";

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
  const activePlayer = document.getElementById("active-player");
  const player1Points = document.getElementById("player1-points");
  const player2Points = document.getElementById("player2-points");

  if (romanceScore) {
    romanceScore.textContent = String(state.romanceScore);
  }

  if (activePlayer) {
    activePlayer.textContent = String(state.activePlayer);
  }

  if (player1Points) {
    player1Points.textContent = String(state.player1Points);
  }

  if (player2Points) {
    player2Points.textContent = String(state.player2Points);
  }
}
