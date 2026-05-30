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
| AI Game Master (secure) | Cloudflare Worker | Free |
| Claude API | Anthropic | ~$0.02–0.05 per game |

That's it. Four things.

---

### 1. Plain HTML / CSS / JavaScript
No frameworks, no build tools, no install step. You write files, open them in a browser, and they work. Every piece of game state (scores, character data, scene history) lives in JavaScript variables in memory for the duration of the session.

### 2. GitHub Pages
Push your code to a GitHub repo, enable Pages in settings, and your app is live at `yourusername.github.io/plot-point`. Free forever. No server to manage.

### 3. Cloudflare Worker
A 15-line script that lives in the cloud. Your app sends it the game context; it adds your Claude API key and forwards the request to Claude; it returns the response. This is the only reason it exists — to keep your API key out of your JavaScript files where anyone could find it.

### 4. Claude API
The AI Game Master. You send it a prompt describing the current game state and it returns narration, scene setups, woven Mad Libs text, and plot twist rewrites. Model: `claude-sonnet-4-5`.

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
  (holds API key securely)
       |
       ↓
  CLAUDE API
  (generates scenes, narration, Mad Libs, twists)
```

**Private inputs**: When a player needs to enter something privately (character answers, Mad Libs, Free Write), the app shows only that player's input field. After they submit, the screen clears before the device is handed to the other player. The other player never sees the raw input — only what the AI incorporates into the narrative.

---

## Project File Structure

```
plot-point/
│
├── index.html          ← Homepage (Start Game button)
├── game.html           ← Main game screen (all scenes play here)
│
├── css/
│   ├── main.css        ← Global styles
│   ├── game.css        ← Game screen styles
│   └── slots.css       ← Slot machine animation
│
├── js/
│   ├── state.js        ← All game state (one object, lives in memory)
│   ├── ai.js           ← Calls to Cloudflare Worker (Claude)
│   ├── scenes.js       ← Scene loop logic (setup→madlibs→reveal→choice→rolloff→result)
│   ├── slots.js        ← Slot machine mechanics and animation
│   └── ui.js           ← DOM updates, screen transitions, private/shared toggling
│
└── worker/
    └── claude-proxy.js ← Cloudflare Worker script (deployed separately)
```

---

## Game State Object

Everything the app needs to know lives in one JavaScript object in `state.js`. Nothing is saved to a server. If the page refreshes, the game resets — which is fine for an in-person session.

```javascript
const gameState = {
  // Characters
  players: [
    {
      number: 1,
      role: "", gift: "", wound: "", want: "",   // private creation answers
      name: "", portrait: "", physicalDetail: "", // AI-generated
      stats: { guts: 0, charm: 0, wit: 0, heart: 0 },
      plotPoints: 0,
      clues: 0
    },
    { /* same structure for player 2 */ }
  ],

  // Game progress
  currentScene: 1,          // 1–14
  romanceScore: 0,          // 0–14
  activePlayer: 1,          // whose turn it is
  scenePhase: "setup",      // setup | madlibs | reveal | choice | rolloff | result
  plotTwists: [],           // array of twist objects

  // AI memory
  sceneHistory: [],         // summary of each completed scene
  systemPrompt: "",         // built once at game start, sent with every AI call

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

## The Cloudflare Worker (Full Script)

Paste this into the Cloudflare Workers dashboard. Set `CLAUDE_API_KEY` as an environment variable. Done.

```javascript
export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://yourusername.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const body = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: body.messages,
        system: body.system,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
```

---

## Build Order (Phase by Phase)

### Phase 1 — Scaffolding (Week 1)
**Goal**: A working homepage you can open in a browser and push live to GitHub Pages.

1. Create a GitHub repo called `plot-point`
2. Create `index.html` — a "Start Game" button, the game title, a brief description
3. Enable GitHub Pages → app is live at your GitHub URL
4. Deploy the Cloudflare Worker → test it returns a response from Claude
5. Write `js/state.js` with the game state object above
6. Write `js/ai.js` with a single function `callClaude(system, messages)` that posts to your Worker URL and returns the response text

**Prompt for your AI coding assistant**:
> "I'm building a plain JavaScript web app with no frameworks. Write a function called `callClaude(system, messages)` in `js/ai.js`. It should POST to `https://my-worker.workers.dev` with a JSON body containing `system` (a string) and `messages` (an array of `{role, content}` objects). It should return the response text from Claude. Handle errors by logging them and returning null."

---

### Phase 2 — Character Creation (Week 2)
**Goal**: Both players privately answer 4 questions; AI generates portraits and stats.

1. Build a 4-step form in `game.html` — one question per screen, large text input
2. Add a "Pass the device to Player 2" interstitial screen between the two players' inputs — screen goes blank so Player 1's answers aren't visible
3. On completion, call Claude with both characters' answers
4. Claude returns: name, physical detail, stats (one 2, two 3s, one 4), 3-sentence portrait for each player
5. Store everything in `gameState.players`
6. Show both portraits on screen simultaneously — "Begin" button starts the game

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

1. Build the scene state machine in `scenes.js`: `setup → madlibs_p1 → pass → madlibs_p2 → pass → reveal → choice → rolloff → result → next`
2. `setup`: call Claude with scene number + game state → returns location, challenge, goals
3. `madlibs_p1`: Player 1 privately enters word, NPC, action, something funny → pass screen
4. `madlibs_p2`: Player 2 does the same → pass screen
5. Call Claude with all 8 inputs + scene context → returns woven narrative ending in a dilemma
6. `reveal`: full narrative displayed, read aloud together
7. `choice`: two buttons, each showing the relevant stat and what's at stake

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
3. Call Claude with the twist + scene context → rewritten scene ending; store twist in `gameState.plotTwists`
4. Scene 12 (Free Write): Player 1 types privately → pass → Player 2 types → call Claude → shared narrative
5. Scene 14 (The Declaration): full-screen prompt for each player to speak aloud; "We said it" confirm button
6. End screen: romance score → ending type, plot point winner

---

### Phase 6 — Polish (Week 7–8)

- CSS transitions between scene phases (fade in/out)
- Sound: ambient music + reel click sounds using the Web Audio API
- Mobile layout — large tap targets, readable text on a phone screen
- Setting swap: load a different `setting.js` file to change genre/world
- Error handling: if the Claude call fails, show a retry button
- "Start Over" button that resets `gameState` and returns to the homepage

---

## Key Prompting Tips for AI Coding Assistants

**Lead with your stack**: Always open with — *"I'm building a plain JavaScript web app with no frameworks. Vanilla JS only."* Otherwise Codex will reach for React or Node.

**Reference your existing files**: *"I already have `js/state.js` which exports a `gameState` object and `js/ai.js` which exports `callClaude()`. Now write..."*

**One function at a time**: Build and test one thing, then move on.

**When something breaks**: Paste the exact error from the browser console + the relevant code. Say: *"Here's the error and the code that caused it. What's wrong?"*

**Ask for comments**: *"Add a plain English comment above each function explaining what it does."*

---

## First Steps This Week

1. **Create accounts**: GitHub, Cloudflare, Anthropic (console.anthropic.com)
2. **Create a GitHub repo** called `plot-point`
3. **Create `index.html`** with just the title and a Start button
4. **Enable GitHub Pages** — your page is live
5. **Deploy the Cloudflare Worker** — paste the script above, add your Claude API key
6. **Test the connection**: write a quick `callClaude()` call that sends "say hello" and logs the response
7. Start Phase 1

---

*Tech Plan v0.3 — May 2026 — Single-device, no database*
*Paired with: Plot_Point_Game_Design_Document.md v0.1*
