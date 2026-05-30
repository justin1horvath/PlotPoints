export function rollPlotPoint() {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollChallenge(difficulty = 6) {
  return rollPlotPoint() >= difficulty;
}
