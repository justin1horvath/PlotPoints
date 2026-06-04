import { saveGameState, state } from "./state.js";

// Adds one AI request/response record to the current game's in-memory log.
export function recordAiLogEntry(entry) {
  state.aiLog.push({
    id: state.aiLog.length + 1,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  saveGameState();
}

// Builds the complete log object that can be inspected or downloaded.
export function buildAiLogFile() {
  return {
    game: "Plot Point",
    session: state.aiLogSession,
    note:
      "This log records what the browser app sent to the Cloudflare Worker and what the Worker returned to the browser.",
    entries: state.aiLog,
  };
}

// Downloads the current game's AI log as a JSON file.
export function downloadAiLog() {
  const logFile = buildAiLogFile();
  const json = JSON.stringify(logFile, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${state.aiLogSession.id}-ai-log.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
