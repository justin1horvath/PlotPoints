import { state } from "./state.js";

export function renderPhase() {
  const phaseDisplay = document.getElementById("phase-display");
  if (phaseDisplay) {
    phaseDisplay.textContent = `Current phase: ${state.phase}`;
  }
}

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
