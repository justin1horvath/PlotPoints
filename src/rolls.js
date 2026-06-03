// Rolls one six-sided die for simple prototype checks.
export function rollPlotPoint() {
  return Math.floor(Math.random() * 6) + 1;
}

// Returns true when a prototype die roll meets or beats the target difficulty.
export function rollChallenge(difficulty = 6) {
  return rollPlotPoint() >= difficulty;
}
