# Plot Point — Tech Plan
### Building the Web App with Plain JavaScript + AI Coding Assistance

---

## What You're Building

A single-device web app where two players sit together, pass one phone/tablet/laptop back and forth, and play through a 14-scene collaborative romance RPG guided by an AI Game Master. The app handles:

- Private character creation (device is passed; inputs are hidden after submission)
- AI-generated scene narration, Mad Libs, and dilemmas
- Animated slot machine roll-offs
- Shared scoreboard (romance score + plot points)
- Plot Twist detection and AI scene rewrites
- Special scenes: Free Write and The Declaration

No accounts. No multiplayer sync. No database. One device, one URL.

---

## Tech Stack

| Need | Tool | Cost |
|---|---|---|
| App code | Plain HTML / CSS / JavaScript | Free |
| Hosting | GitHub Pages | Free |
| AI Game Master proxy | Cloudflare Worker + Wrangler | Free |
| Structured output validation | Zod | Free |
| First AI provider | OpenAI API | Usage-based; start with a low-cost model |

Still intentionally small: static browser app, one Worker, one validation library, one first AI provider.

---

### 1. Plain HTML / CSS / JavaScript
No frameworks, no build tools, no install step. You write files, open them in a browser, and they work. Every piece of game state (scores, character data, scene history) lives in JavaScript variables in memory for the duration of the session.

### 2. GitHub Pages
Push your code to a GitHub repo, enable Pages in settings, and your app is live at `yourusername.github.io/plot-point`. Free forever. No server to manage.

### 3. Cloudflare Worker
A small script that lives in the cloud. Your app sends it the game context; it adds the private provider API key and forwards the request to the selected AI provider; it returns validated data. This keeps API keys out of browser JavaScript and gives us one place to swap providers later.

The Worker should be managed locally with Cloudflare Wrangler once npm libraries are needed. This allows the Worker to use packages such as `openai` and `zod`, instead of pasting all code into the Cloudflare dashboard.

### 4. Zod
Zod defines the exact shape of data the app expects from AI calls. It validates character data, scene data, story log entries, choices, and future structured outputs. Zod is provider-neutral: OpenAI, Anthropic, Gemini, or another provider can all be adapted to return the same Zod-validated shapes.

### 5. OpenAI API
The first AI provider. You send it a prompt describing the current game state and it returns narration, scene setups, woven Mad Libs text, and plot twist rewrites. Start with a cost-conscious model; upgrade later if the prose needs more nuance.

---

## How the App Works

```
ONE DEVICE (browser)
       |
       | (all game state lives here, in memory)
       |
  HTML/JS/CSS
  (GitHub Pages)
       |
       | (when AI narration is needed)
       ↓
  CLOUDFLARE WORKER
  (holds API key securely, validates output)
       |
       ↓
  AI PROVIDER
  (OpenAI first; adapter can change later)
```

**Private inputs**: When a player needs to enter something privately (character answers, Mad Libs, Free Write), the app shows only that player's input field. After they submit, the screen clears before the device is handed to the other player. The other player never sees the raw input — only what the AI incorporates into the narrative.

---

## Project File Structure

```
plot-point/
│
├── index.html          ← Homepage (Start Game button)
├── styles.css          ← Global styles
│
├── src/
│   ├── state.js        ← All game state (one object, lives in memory)
│   ├── ai.js           ← Calls to Cloudflare Worker (provider-neutral)
│   ├── promptBuilder.js ← Assembles reusable OpenAI prompts
│   ├── sceneBlueprints.js ← Scene-by-scene AI instructions
│   ├── scenes.js       ← Scene router that dispatches by blueprint type
│   ├── ui.js           ← Shared phase and scoreboard rendering
│   ├── sceneTypes/
│   │   └── madlibsScene.js ← Mad Libs scene interaction flow
│   ├── rolls.js        ← Roll-off mechanics
│   └── app.js          ← App initialization and event wiring
│
├── settings/
│   └── default-setting.md ← Default genre/world source material
│
└── worker/
    ├── index.js        ← Cloudflare Worker entrypoint (planned Wrangler project)
    ├── providers/
    │   ├── openaiProvider.js
    │   ├── anthropicProvider.js
    │   └── geminiProvider.js
    └── schemas/
        ├── characterSchema.js
        └── sceneSchema.js
```

---

## AI Prompt Architecture

The game should not hide major prompt logic inside one-off functions forever. Each AI request should be assembled from predictable parts so the story stays controllable, debuggable, and expandable across all 14 scenes.

### Prompt Inputs

Every scene-generation prompt should be built from five sources:

1. **Story Bible**
   - Lives in `settings/default-setting.md`.
   - Defines genre, tone, world details, magic/tech level, romance style, content boundaries, recurring motifs, possible locations, and possible antagonists.
   - Included in major AI calls so the model writes in the correct world.

2. **Character State**
   - Lives in `state.players`.
   - Includes private creation answers, generated names, physical details, stats, and eventually public bios/private notes.
   - Private turn ons and wants may be passed to the model, but prompts must instruct the model not to reveal them directly unless the scene calls for it.

3. **Story So Far**
   - Lives in `state.storyLog`.
   - Should be compact structured memory, not the full text of every scene.
   - Each completed scene should store a summary, emotional shift, important facts, unresolved threads, and romance beat.
   - Preferred strategy: ask OpenAI to return a `storyLogEntry` as part of the same scene-generation response. This avoids an extra summary API call while still preserving emotional continuity.

4. **Scene Blueprint**
   - Implemented file: `src/sceneBlueprints.js`.
   - Defines what each scene number is supposed to do.
   - Includes act, scene name, scene type, description, tone, app rules, Mad Lib prompt pool, and AI constraints.
   - `type` and `rules` are used by the JavaScript app to choose the scene flow and UI behavior.
   - `constraints` are sent to the AI model so it knows what the generated scene must do or avoid.
   - The current implemented scene type is `madlibs_scene`, implemented in `src/sceneTypes/madlibsScene.js`. Future scene types should get their own files in `src/sceneTypes/` and be registered once in `src/scenes.js`.

5. **Player Inputs**
   - Lives in `state.currentSceneData.madLibsInputs`.
   - Includes the blind Mad Libs words supplied privately by each player.
   - For the current scene loop, the app randomly assigns two prompt types to each player from the shared four-prompt pool and randomizes each player's prompt order.
   - Later scenes may also include choices, Free Write text, plot twist selections, and clue spending.

### Prompt Builder

Implemented file: `src/promptBuilder.js`.

This file should assemble prompts instead of letting each scene function hand-write a full prompt. The goal is a reusable function like:

```javascript
buildScenePrompt({
  activePlayer,
  blueprint,
  players,
  storyLog,
  madLibsText,
});
```

The assembled prompt should use clear sections:

```text
SYSTEM ROLE
You are the AI Game Master for Plot Point...

STORY BIBLE
[setting/default-setting.md]

CHARACTERS
[public character data + private emotional hooks]

STORY SO FAR
[compact scene summaries]

CURRENT SCENE BLUEPRINT
[scene number, description, tone, constraints]

PLAYER MAD LIBS
[player 1 inputs]
[player 2 inputs]

OUTPUT FORMAT
Return strict JSON only...
```

For Scene 1, `scenes.js` now calls a reusable `startScene(sceneNumber)` function. That function looks up the blueprint, uses the app-only `type` to choose the scene type handler, then delegates the interaction to `src/sceneTypes/madlibsScene.js`. The Mad Libs scene handler uses the app-only `rules`, collects randomized Mad Lib inputs, builds the prompt from the scene description and AI constraints, asks the Worker for validated JSON, stores the returned `storyLogEntry`, and renders the reveal.

### Structured Output Contracts

The app should use Zod schemas as the source of truth for structured AI responses. A prompt describes the creative task; a Zod schema defines the required data shape.

Example scene schema:

```javascript
const SceneSchema = z.object({
  title: z.string(),
  location: z.string(),
  setup: z.string(),
  goals: z.object({
    player1: z.string(),
    player2: z.string(),
  }),
  narrative: z.string(),
  storyLogEntry: z.object({
    summary: z.string(),
    emotionalShift: z.string(),
    unresolvedThreads: z.array(z.string()),
    importantFacts: z.array(z.string()),
    romanceBeat: z.string(),
  }),
});
```

Zod should be used to:

- Define the expected response shape for each AI task.
- Validate model output before storing it in game state.
- Produce clearer errors when a response is missing required fields.
- Keep response contracts provider-neutral.

Structured JSON responses need enough output budget to finish the full object. Current targets are roughly 1,500 output tokens for character generation and 6,000 output tokens for scene generation. If errors mention unterminated strings or truncated JSON, increase the relevant `max_output_tokens` before changing the schema.

### AI Provider Adapter

The browser app should not call OpenAI-specific behavior directly. It should call one stable Worker endpoint with a task name and payload:

```javascript
POST /generate
{
  "task": "generate_scene",
  "payload": { ... }
}
```

The Worker should return the same shape regardless of provider:

```javascript
{
  "ok": true,
  "data": { ...validated scene object... }
}
```

Provider-specific code should live behind adapters:

```text
worker/
  providers/
    openaiProvider.js
    anthropicProvider.js
    geminiProvider.js
```

Each provider adapter should implement the same app-facing functions:

```javascript
generateCharacter(input)
generateScene(input)
```

OpenAI is the first provider. Its adapter can use the OpenAI JavaScript SDK and Zod helpers. If the project later switches to Anthropic, Gemini, or another provider, only the provider adapter should change; browser UI, game state, scene blueprints, and prompt builder should remain stable.

### AI Call Log

For debugging and tuning, each model call is stored in memory for the current game:

```javascript
aiLog: [
  {
    id: 1,
    task: "generate_scene",
    status: "success",
    request: {
      task: "generate_scene",
      payload: {
        prompt: "...",
        maxOutputTokens: 6000
      }
    },
    response: {
      httpStatus: 200,
      body: {
        ok: true,
        data: {}
      }
    },
    createdAt: "2026-05-31T12:00:00.000Z"
  }
]
```

This lets us answer:

- What exactly did the app send to OpenAI?
- What did OpenAI return?
- What did the app successfully parse?
- Why did a scene feel wrong or fail?

The browser app cannot silently create files on the user's computer, so the log lives in memory and can be downloaded with the **Download AI Log** button. A new log session starts whenever the player starts a new story.

The log captures what the browser sends to the Cloudflare Worker and what the Worker returns to the browser. It does not expose the OpenAI API key. It also does not include hidden OpenAI SDK internals unless the Worker is later changed to return additional debug metadata.

### Design Rule

Use one reusable scene prompt builder plus scene blueprints, not fourteen unrelated scene prompts. Scene-specific flavor should live in blueprints; shared formatting, memory, safety, and output instructions should live in the prompt builder.

### Current Story Summary Plan

Scene 1 now asks OpenAI to return scene content and story memory in one JSON response:

```javascript
{
  title: "",
  location: "",
  setup: "",
  goals: { player1: "", player2: "" },
  narrative: "",
  storyLogEntry: {
    summary: "",
    emotionalShift: "",
    unresolvedThreads: [],
    importantFacts: [],
    romanceBeat: ""
  }
}
```

The app stores `storyLogEntry` in `state.storyLog` and adds mechanical result fields itself. This gives future prompts story continuity without making a separate summarization request.

The scene response still includes structured fields like `location` and `goals`, but the reveal screen does not display those as separate boxes. The prompt instructs the model to weave those details into `narrative`, and the player-facing reveal shows the title, read-aloud instruction, and narrative text.

The prototype now routes browser AI calls through provider-neutral task names. The intended next architecture is to deploy the Wrangler-managed Worker so schemas and provider calls live server-side using Zod. Prompts can still describe the desired creative behavior, but Zod should enforce the response shape for character generation, scene generation, and future scene summaries.

---

## Game State Object

Everything the app needs to know lives in one JavaScript object in `state.js`. Nothing is saved to a server.

The browser also saves the current game to `sessionStorage` while players type and when major game phases change. This protects the prototype from accidental page reloads during local development. If the page refreshes in the same browser tab, the app restores the current screen and the latest typed input. Starting a new story resets that saved session.

```javascript
const gameState = {
  // Characters
  players: [
    {
      number: 1,
      role: "", gift: "", turnOn: "", want: "",   // private creation answers
      name: "", physicalDetail: "", // AI-generated
      stats: { guts: 0, charm: 0, wit: 0, heart: 0 },
      plotPoints: 0,
      clues: 0
    },
    { /* same structure for player 2 */ }
  ],

  // Game progress
  currentScene: 1,          // 1–14
  romanceScore: 0,          // 0–14
  activePlayer: 1,          // randomly assigned at new game start
  scenePhase: "setup",      // setup | madlibs | reveal | choice | rolloff | result
  plotTwists: [],           // array of twist objects

  // AI memory
  storyBible: "",           // loaded from settings/default-setting.md
  storyLog: [],             // compact summaries of completed scenes
  aiLog: [],                // prompt/response debugging records
  systemPrompt: "",         // shared AI GM behavior instructions

  // Current scene working data
  currentSceneData: {
    location: "",
    challenge: "",
    goals: { player1: "", player2: "" },
    madLibsInputs: { player1: {}, player2: {} },
    narrative: "",
    dilemma: { optionA: {}, optionB: {} },
    rollResult: null
  }
};
```

---

## Cloudflare Worker Plan

The Worker should move from dashboard-pasted code to a local Wrangler-managed Worker project once we use npm libraries. This allows the Worker to install and bundle `openai`, `zod`, and any future provider SDKs.

Planned Worker responsibilities:

- Receive provider-neutral requests from the browser app.
- Route each request by task name, such as `generate_character` or `generate_scene`.
- Build or receive the prompt payload for that task.
- Call the currently selected provider adapter.
- Validate the provider output against the relevant Zod schema.
- Return `{ ok: true, data }` or `{ ok: false, error }` to the browser.

Planned local Worker setup:

```bash
npm create cloudflare@latest worker
cd worker
npm install openai zod
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

OpenAI should be the first adapter, but the browser app should not know that. The browser should only call the Worker endpoint and receive validated game data.

---

## Build Order (Phase by Phase)

### Phase 1 — Scaffolding (Week 1)
**Goal**: A working homepage you can open in a browser and push live to GitHub Pages.

1. Create a GitHub repo called `plot-point`
2. Create `index.html` — a "Start Game" button, the game title, a brief description
3. Enable GitHub Pages → app is live at your GitHub URL
4. Deploy the Cloudflare Worker → test it returns a response from the configured AI provider
5. Write `src/state.js` with the game state object above
6. Write `src/ai.js` with a provider-neutral function that posts to your Worker URL and returns validated data

**Prompt for your AI coding assistant**:
> "I'm building a plain JavaScript web app with no frameworks. Write a function in `src/ai.js` that POSTs to `https://my-worker.workers.dev/generate` with a JSON body containing `task` and `payload`. It should return validated data from the Worker. Handle errors by logging them and returning null."

**Local testing note**: Because the app uses JavaScript modules, test locally with VS Code's Live Server extension or another local web server. Do not test by double-clicking `index.html` and opening it as a `file://` URL; browser module/CORS rules can prevent the app from running.

---

### Phase 2 — Character Creation (Week 2)
**Goal**: Both players privately answer 4 questions; AI generates names, physical details, and stats. Full portraits are deferred until the core flow is stable.

1. Build a 4-step form in the main `index.html` game panel — one question per screen, large text input
2. Add a "Pass the device to Player 2" interstitial screen between the two players' inputs — screen goes blank so Player 1's answers aren't visible
3. On completion, call the Worker with both characters' answers
4. The provider adapter returns validated name, physical detail, and stats (one 2, two 3s, one 4) for each player
5. Store everything in `gameState.players`
6. Show both generated character summaries on screen simultaneously — "Begin" button starts the game

**The "pass the device" pattern** (used throughout the game):
```javascript
function showPassScreen(message, onConfirm) {
  // Clears the screen, shows only the message and a button
  // e.g. "Hand the device to Player 2"
  // When they tap the button, calls onConfirm()
  // This is how private inputs stay private
}
```

---

### Phase 3 — Scene Engine (Weeks 3–4)
**Goal**: AI generates scenes, players submit Mad Libs privately, scene is revealed together.

1. Build scene type modules under `src/sceneTypes/`. `scenes.js` should stay a small router that maps blueprint `type` values to the correct module.
2. `setup`: call the Worker with scene number + game state → provider adapter returns validated scene data
3. `madlibs_active`: the active player privately answers two randomized prompts from the Mad Libs pool → pass screen
4. `madlibs_other`: the other player privately answers the remaining two randomized prompts → pass screen
5. Call the Worker with all 4 inputs + scene context → returns woven narrative ending in a dilemma
6. `reveal`: full narrative displayed; active player reads aloud
7. `choice`: two buttons, each showing the relevant stat and what's at stake

**Current implementation status**: Scene 1 now uses the reusable scene blueprint + prompt builder + scene type module structure. It supports two randomized private Mad Lib prompts per player and an AI-generated Ordinary World reveal. Scene choices, roll-offs, additional scene type modules, and the transition into Scene 2 are still upcoming.

---

### Phase 4 — The Slot Machine (Week 5)
**Goal**: Animated reels both players watch spin together on the shared screen.

1. Build a `SlotMachine` class in `slots.js` — takes reel count (2, 3, or 4)
2. Icons: ⚔️ ❤️ 🔍 ✨ 🌟 🔎 — CSS `@keyframes` spin animation landing on a random result
3. Both players' reels spin simultaneously on the same screen
4. Count matching icons of the chosen stat + WILD (🌟); highest total wins
5. Detect Three of a Kind → Plot Twist trigger
6. Detect 2+ CLUE (🔎) → award clue to that player
7. Animate result: plot point tick, romance score tick

**Prompt for your AI coding assistant**:
> "Write a plain JavaScript class called `SlotMachine` in `slots.js`. Constructor takes `reelCount` (2, 3, or 4) and a container DOM element. Each reel is a div that animates with CSS and lands on one of: ⚔️ ❤️ 🔍 ✨ 🌟 🔎. All reels spin simultaneously when `spin()` is called. After landing, call an `onResult(resultsArray)` callback. No frameworks or dependencies."

---

### Phase 5 — Plot Twists & Special Scenes (Week 6)
**Goal**: Three-of-a-kind handling, twist selection UI, Free Write, Declaration.

1. After each roll result, check for three identical non-CLUE icons
2. If triggered: show 10 twist options from the GDD; active player picks one
3. Call OpenAI with the twist + scene context → rewritten scene ending; store twist in `gameState.plotTwists`
4. Scene 12 (Free Write): Player 1 types privately → pass → Player 2 types → call OpenAI → shared narrative
5. Scene 14 (The Declaration): full-screen prompt for each player to speak aloud; "We said it" confirm button
6. End screen: romance score → ending type, plot point winner

---

### Phase 6 — Polish (Week 7–8)

- CSS transitions between scene phases (fade in/out)
- Sound: ambient music + reel click sounds using the Web Audio API
- Mobile layout — large tap targets, readable text on a phone screen
- Setting swap: load a different `setting.js` file to change genre/world
- Error handling: if the OpenAI call fails, show a retry button
- "Start Over" button that resets `gameState` and returns to the homepage

---

## Key Prompting Tips for AI Coding Assistants

**Lead with your stack**: Always open with — *"I'm building a plain JavaScript web app with no frameworks. Vanilla JS only."* Otherwise Codex will reach for React or Node.

**Reference your existing files**: *"I already have `src/state.js` which exports a `state` object and `src/ai.js` which calls the Worker. Now write..."*

**One function at a time**: Build and test one thing, then move on.

**When something breaks**: Paste the exact error from the browser console + the relevant code. Say: *"Here's the error and the code that caused it. What's wrong?"*

**Ask for comments**: *"Add a plain English comment above each function explaining what it does."*

---

## First Steps This Week

1. **Create accounts**: GitHub, Cloudflare, OpenAI Platform
2. **Create a GitHub repo** called `plot-point`
3. **Create `index.html`** with just the title and a Start button
4. **Enable GitHub Pages** — your page is live
5. **Deploy the Cloudflare Worker** — start with a simple proxy, then migrate it into a Wrangler project when adding npm packages
6. **Install Worker dependencies when ready** — `openai` and `zod`
7. **Create provider adapters** — OpenAI first, with room for Anthropic/Gemini later
8. **Test the connection**: send a small `generate_character` or `generate_scene` task and confirm the Worker returns validated data
9. Start Phase 1

---

*Tech Plan v0.5 — June 2026 — Single-device, no database, provider-neutral AI adapter with Zod*
*Paired with: Plot_Point_Game_Design_Document.md v0.1*
