import { getSceneBlueprint } from "./sceneBlueprints.js";
import {
  renderMadLibsSceneInput,
  renderMadLibsSceneReveal,
  startMadLibsScene,
} from "./sceneTypes/madlibsScene.js";
import { state } from "./state.js";
export { renderPhase, renderScoreboard } from "./ui.js";

// Compatibility wrapper for the current character creation flow.
export function startFirstScene() {
  startScene(0);
}

// Starts the correct reusable scene flow for a blueprint.
export function startScene(sceneNumber) {
  const blueprint = getSceneBlueprint(sceneNumber);
  const sceneType = getSceneTypeHandler(blueprint.type);

  sceneType.start(blueprint);
}

// Restores the correct input screen for the current scene type after a reload.
export function renderSceneMadLibs(playerNumber) {
  getCurrentSceneTypeHandler().renderInput(playerNumber);
}

// Restores the correct reveal screen for the current scene type after a reload.
export function renderSceneReveal() {
  getCurrentSceneTypeHandler().renderReveal();
}

// Finds the current scene type handler from saved scene state.
function getCurrentSceneTypeHandler() {
  const sceneType = state.currentSceneData.blueprint?.type;

  if (!sceneType) {
    throw new Error("No active scene type found.");
  }

  return getSceneTypeHandler(sceneType);
}

// Maps blueprint scene types to the module that owns that interaction.
function getSceneTypeHandler(sceneType) {
  const sceneTypes = {
    madlibs_scene: {
      start: startMadLibsScene,
      renderInput: renderMadLibsSceneInput,
      renderReveal: renderMadLibsSceneReveal,
    },
  };

  const handler = sceneTypes[sceneType];

  if (!handler) {
    throw new Error(`Unsupported scene type: ${sceneType}`);
  }

  return handler;
}
