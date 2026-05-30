export const state = {
  phase: "None",
  romanceScore: 0,
  player1Points: 0,
  player2Points: 0,
  storyLog: [],
};

export function resetState() {
  state.phase = "None";
  state.romanceScore = 0;
  state.player1Points = 0;
  state.player2Points = 0;
  state.storyLog = [];
}
