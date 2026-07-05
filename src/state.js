export const state = {
  phase: "None",
  romanceScore: 0,
  player1Points: 0,
  player2Points: 0,
  storyDirection: createDefaultStoryDirection(),
  storyMemory: createEmptyStoryMemory(),
  players: [
    createEmptyPlayer(1),
    createEmptyPlayer(2),
  ],
  characterCreation: {
    currentPlayer: 1,
    questionIndex: 0,
    isComplete: false,
  },
  currentScene: 0,
  scenePhase: "none",
  activePlayer: 1,
  currentSceneData: createEmptySceneData(),
  storyLog: [],
  aiLogSession: createAiLogSession(),
  aiLog: [],
};

const SAVED_GAME_KEY = "plot-point-current-game";

// Restores the game to its starting values before a new story begins.
export function resetState() {
  state.phase = "None";
  state.romanceScore = 0;
  state.player1Points = 0;
  state.player2Points = 0;
  state.storyDirection = createDefaultStoryDirection();
  state.storyMemory = createEmptyStoryMemory();
  state.players = [
    createEmptyPlayer(1),
    createEmptyPlayer(2),
  ];
  state.characterCreation = {
    currentPlayer: 1,
    questionIndex: 0,
    isComplete: false,
  };
  state.currentScene = 0;
  state.scenePhase = "none";
  state.activePlayer = getRandomPlayerNumber();
  state.currentSceneData = createEmptySceneData();
  state.storyLog = [];
  state.aiLogSession = createAiLogSession();
  state.aiLog = [];
  saveGameState();
}

// Returns the non-active player number in a two-player game.
export function getInactivePlayerNumber() {
  return state.activePlayer === 1 ? 2 : 1;
}

// Updates which player leads the next active-player scene activity.
export function setActivePlayer(playerNumber) {
  if (![1, 2].includes(playerNumber)) {
    throw new Error(`Invalid active player: ${playerNumber}`);
  }

  state.activePlayer = playerNumber;
  saveGameState();
}

// Saves the current game state in this browser tab so a reload can recover it.
export function saveGameState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SAVED_GAME_KEY, JSON.stringify(state));
}

// Loads the last saved game state for this browser tab.
export function loadSavedGameState() {
  if (typeof window === "undefined") {
    return false;
  }

  const savedGame = window.sessionStorage.getItem(SAVED_GAME_KEY);

  if (!savedGame) {
    return false;
  }

  try {
    Object.assign(state, JSON.parse(savedGame));
    if (![1, 2].includes(state.activePlayer)) {
      state.activePlayer = getRandomPlayerNumber();
    }
    state.storyDirection = {
      ...createDefaultStoryDirection(),
      ...(state.storyDirection || {}),
    };
    state.storyMemory = {
      ...createEmptyStoryMemory(),
      ...(state.storyMemory || {}),
    };
    state.players = state.players.map((player) => ({
      ...createEmptyPlayer(player.number),
      ...player,
    }));
    if (!Array.isArray(state.currentSceneData.inputOrder)) {
      state.currentSceneData.inputOrder = [];
    }
    return state.phase !== "None";
  } catch (error) {
    console.error("Saved game could not be restored:", error);
    window.sessionStorage.removeItem(SAVED_GAME_KEY);
    return false;
  }
}

// Creates basic metadata for one game's AI communication log.
function createAiLogSession() {
  const startedAt = new Date().toISOString();

  return {
    id: `plot-point-${startedAt.replaceAll(":", "-")}`,
    startedAt,
  };
}

// Creates the high-level story direction that every generated scene should honor.
export function createDefaultStoryDirection() {
  return {
    genre: "paranormal mystery",
    setting:
      "New England coastal town with a history of witchcraft and strange, unexplained events",
    antagonist: "werewolf who lusts for blood, but who hates what he turns into",
    plot: "solve the mystery of a missing girl",
    romanceDynamic: "rivals to lovers",
  };
}

// Creates the evolving story memory that future scene prompts can reference.
export function createEmptyStoryMemory() {
  return {
    currentSituation: "",
    establishedFacts: [],
    unresolvedMysteries: [],
    activeThreats: [],
    relationshipState: "",
    openPromises: [],
  };
}

// Applies one validated scene delta without discarding untouched story continuity.
export function mergeStoryMemory(currentMemory, updates) {
  return {
    currentSituation:
      updates.currentSituation?.trim() || currentMemory.currentSituation,
    establishedFacts: applyMemoryListUpdates(
      currentMemory.establishedFacts,
      updates.establishedFacts?.add,
      updates.establishedFacts?.remove
    ),
    unresolvedMysteries: applyMemoryListUpdates(
      currentMemory.unresolvedMysteries,
      updates.unresolvedMysteries?.add,
      updates.unresolvedMysteries?.resolve
    ),
    activeThreats: applyMemoryListUpdates(
      currentMemory.activeThreats,
      updates.activeThreats?.add,
      updates.activeThreats?.resolve
    ),
    relationshipState:
      updates.relationshipState?.trim() || currentMemory.relationshipState,
    openPromises: applyMemoryListUpdates(
      currentMemory.openPromises,
      updates.openPromises?.add,
      updates.openPromises?.resolve
    ),
  };
}

// Removes resolved entries by normalized exact text, then appends unique additions.
function applyMemoryListUpdates(currentItems = [], additions = [], removals = []) {
  const removalKeys = new Set(removals.map(normalizeMemoryItem));
  const retainedItems = currentItems.filter(
    (item) => !removalKeys.has(normalizeMemoryItem(item))
  );
  const mergedItems = [...retainedItems];
  const mergedKeys = new Set(mergedItems.map(normalizeMemoryItem));

  additions.forEach((item) => {
    const trimmedItem = item.trim();
    const normalizedItem = normalizeMemoryItem(trimmedItem);

    if (trimmedItem && !mergedKeys.has(normalizedItem)) {
      mergedItems.push(trimmedItem);
      mergedKeys.add(normalizedItem);
    }
  });

  return mergedItems;
}

// Makes list comparisons insensitive to capitalization and surrounding whitespace.
function normalizeMemoryItem(item = "") {
  return item.trim().toLowerCase();
}

// Randomly selects Player 1 or Player 2.
function getRandomPlayerNumber() {
  return Math.random() < 0.5 ? 1 : 2;
}

// Creates the default data shape for one player's private answers and generated stats.
function createEmptyPlayer(number) {
  return {
    number,
    answers: {
      role: "",
      gift: "",
      turnOn: "",
      want: "",
    },
    name: "",
    physicalDetail: "",
    goal: "",
    stats: {
      guts: 0,
      charm: 0,
      wit: 0,
      heart: 0,
    },
  };
}

// Creates the default data shape for the scene currently being played.
function createEmptySceneData() {
  return {
    title: "",
    location: "",
    setup: "",
    goals: {
      player1: "",
      player2: "",
    },
    scenePlan: null,
    madLibsInputs: {
      player1: createEmptyMadLibs(),
      player2: createEmptyMadLibs(),
    },
    assignedMadLibFields: {
      player1: [],
      player2: [],
    },
    inputOrder: [],
    narrative: "",
    storyLogEntry: null,
  };
}

// Creates the storage object for the available Mad Libs prompt types.
function createEmptyMadLibs() {
  return {
    word: "",
    npc: "",
    action: "",
    funny: "",
  };
}
