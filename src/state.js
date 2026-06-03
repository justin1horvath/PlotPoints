export const state = {
  phase: "None",
  romanceScore: 0,
  player1Points: 0,
  player2Points: 0,
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
  currentSceneData: createEmptySceneData(),
  storyLog: [],
};

// Restores the game to its starting values before a new story begins.
export function resetState() {
  state.phase = "None";
  state.romanceScore = 0;
  state.player1Points = 0;
  state.player2Points = 0;
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
  state.currentSceneData = createEmptySceneData();
  state.storyLog = [];
}

// Creates the default data shape for one player's private answers and generated stats.
function createEmptyPlayer(number) {
  return {
    number,
    answers: {
      role: "",
      gift: "",
      wound: "",
      want: "",
    },
    name: "",
    physicalDetail: "",
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
    madLibsInputs: {
      player1: createEmptyMadLibs(),
      player2: createEmptyMadLibs(),
    },
    narrative: "",
    storyLogEntry: null,
  };
}

// Creates the four private Mad Libs prompts each player answers before a scene.
function createEmptyMadLibs() {
  return {
    word: "",
    npc: "",
    action: "",
    funny: "",
  };
}
