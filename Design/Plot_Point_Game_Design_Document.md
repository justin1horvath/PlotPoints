# Game Design Document
## Working Title: Plot Point
### A Collaborative AI-GM Romance RPG

---

## Overview

Plot Point is a two-player in-person storytelling game where players collaborate with an AI Game Master to build a romantic story structured around the Hero's Journey and three-act narrative framework. The game blends Mad Libs, improv, and RPG mechanics into a fast, emotionally resonant experience. Players compete for individual plot points while cooperating to build a shared romance score — and ultimately win together if their characters fall in love.

**Device & Play Format**
Plot Point is a single-device game. Both players share one phone, tablet, or laptop throughout the session. The device is passed between players when private input is needed — character creation answers, Mad Libs inputs, and the Free Write are each entered on the device privately before it is handed back or turned to face the table. All shared screens (scene reveals, the scoreboard, roll-offs, and the Declaration) are read together. No second screen, app install, or account is required to play.

**Current Web Implementation Note**
The website version uses an AI Game Master powered by the OpenAI API. The API key is never stored in the browser app; instead, the static JavaScript app calls a small Cloudflare Worker, and the Worker securely forwards AI requests to OpenAI.

---

## Core Philosophy

```
Two players. One story. Competing to shape it. Cooperating to land it.

The AI GM is not an opponent — it is the author pulling the story
toward its most interesting version of itself.

Players never lose the story. They only influence how it ends.
```

---

## The Players & Characters

Each player controls one character. The characters do not know each other at the start of the game. One of the first scenes is always their meeting.

### Character Creation

Character creation takes under three minutes. Players answer four questions **privately** on their own screen. They do not share answers with each other.

```
1. WHAT DO YOU DO?
   Your character's job, role, or title in this world.

2. WHAT IS YOUR GIFT?
   The one thing you can do that almost no one else can.

3. WHAT ARE YOU STILL CARRYING?
   Your wound. One sentence is enough.

4. WHAT DO YOU WANT MORE THAN ANYTHING?
   Not from the quest. From your life.
```

The AI uses these four answers to generate automatically:

- A **name** suited to the world and the role
- A **physical detail** that reflects how the character carries themselves
- A **list of four stat scores** (see Stats below)
- A **three-sentence character portrait** read aloud to both players

The portrait implies the wound and the want without stating them directly. The other player should sense something is there without being able to name it yet.

**Example portrait:**

> *"This is Sable — a lean, road-worn musician whose hands are always moving even when there's no instrument nearby. She can read a room like a map and has never met a silence she couldn't fill. She tells herself she prefers the road. She has never once believed it."*

### World Selection

The world will be decided by the game setting.md document. Details and color will be set by this document. The setting.md can be swaped out for alternative genere and settings.  

Settings.md document will include things like tone, time, place, possible antagonists, magic level ect. 

---

## Stats

Each character has four stats rated 2–4. Stats are assigned automatically by the AI from character creation answers. Players do not choose or distribute them.

```
GUTS    → Action, danger, physical challenge, courage
CHARM   → Social scenes, persuasion, first impressions
WIT     → Mysteries, puzzles, figuring things out
HEART   → Emotional scenes, vulnerability, connection
```

**Each player will have one stat = 2, one stat = 4 and two stats =3. 

Stats determine how many reels a player spins during the roll off. Higher stat = more reels = better odds, but never a guarantee.

---

## Scoring

Two separate scores are tracked publicly throughout the game. Both are visible to both players at all times.

### Plot Points (Individual / Competitive)
- Awarded to the player who wins a roll off
- Never lost
- Tiebreaker at the end of the game
- The player with the most plot points wins the competitive layer

### Romance Score (Shared / Cooperative)
- Goes up by 1 every time any roll off is won
- Never goes down
- Determines the ending type
- Both players win the game if the romance score is high enough

```
ROMANCE SCORE    ENDING

0  - 4           💔 The characters part ways.
5  - 7           🤝 Deep Bond. Something real but not romantic.
8  - 10          💛 Something Beginning. Clearly falling.
11 - 13          ❤️  Together. The Declaration lands.
14               ✨ Perfect Story. Every scene was a success.
```

---

## Game Structure

The game consists of **14 scenes** across three acts, following the Hero's Journey framework.

### ACT 1 — The Ordinary World (4 Scenes)
*Tone: Playful, establishing. Players are getting comfortable.*

| #   | Scene             | Notes                                    |
| --- | ----------------- | ---------------------------------------- |
| 1   | Ordinary World    | Who each character is alone              |
| 2   | The Meeting       | First scene with both characters present |
| 3   | Call to Adventure | The quest is established                 |
| 4   | Refusal           | Each character's hesitation surfaces     |

### ACT 2 — The Road of Trials (6 Scenes)
*Tone: Rising tension, growing trust, then rupture.*

| # | Scene | Notes |
|---|---|---|
| 5 | Crossing the Threshold | Point of no return |
| 6 | First Test | Challenge scene |
| 7 | Second Test | The AI engineers a Turn On moment |
| 8 | The Misunderstanding | A flaw surfaces, friction created |
| 9 | The Ordeal | Hardest scene. Both options are difficult. |
| 10 | The Reward | Victory in sight, something unresolved between them |

### ACT 3 — The Return (4 Scenes)
*Tone: Vulnerable, earned, climactic.*

| # | Scene | Notes |
|---|---|---|
| 11 | Road Back | Heading home, something unfinished |
| 12 | The Revelation | Free Write scene (see below) |
| 13 | Resurrection | Final obstacle, internal or external |
| 14 | The Declaration | Final scene, spoken aloud |

---

## The Scene Loop

Every scene follows the same five-step structure.

### Step 1: App Sets the Scene
The AI generates:
- A location
- A challenge or obstacle
- Each character's goal in this scene (may differ — tension lives here)

### Step 2: Mad Libs
Before the scene is revealed, the AI asks each player privately for blind inputs:
- A word
- A character (NPC)
- An action
- Something funny

Neither player knows how their inputs will be used. The AI weaves all eight inputs into the scene narrative.

### Step 3: Scene Reveal
The active player reads the full scene aloud to both players. A dilemma lands at the end.

### Step 4: The Choice
The active player chooses between two actions. The choice is presented with full transparency — both players can see the relevant stats.

```
Example:

⚔️  GUTS  "They have Guts 4. You'll likely lose the plot point —
           but the romance is safe if anyone wins."

💛  HEART  "You both have Heart 2. Even odds — but if nobody
            wins, the romance score doesn't go up."
```

**Design intent:** The active player is always choosing between playing it safe for the shared romance score or gambling for individual plot points. This question — do I prioritize us or myself — is the romantic tension of the game expressed as a mechanic.

### Step 5: The Roll Off
Both players spin simultaneously. Results are compared. The player with the most matching icons of the relevant stat wins.


---

## The Roll Off Mechanic

### The Slot Machine
Each player spins a number of reels equal to their stat score for the chosen action type.

```
Stat 2 → spin 2 reels
Stat 3 → spin 3 reels
Stat 4 → spin 4 reels
```

### The Reel Icons
Each reel contains six possible icons:

```
GUTS   ⚔️    HEART  ❤️    WIT    🔍
CHARM  ✨    WILD   🌟    CLUE   🔎
```

- **WILD** counts as any stat icon
- **CLUE** does not count toward the roll off but triggers a reward (see Clues)

### Clues
If two or more clues come up, then the player earns a clue that can be spent latter in the game.  

### Re Roll
After the roll, a player may choose to spend a clue they were awarded earlier. If a clue is spent then the reels are re spun.
### Winning the Roll Off
Count matching icons of the relevant stat across all reels. Add any WILD icons. Highest total wins.

### Failed Scene
If neither player lands any matching icons:
- No plot point awarded
- Romance score does not increase
- Both players earn 1 Clue as consolation
- The AI writes a "near miss" scene — something almost happened but the moment passed

---

## The Plot Twist

### Trigger
When a player rolls **Three of a Kind** on any symbol during a roll off, a Plot Twist is triggered. The current scene ending is immediately rewritten around the twist.

```
Reel 1: HEART
Reel 2: HEART
[dramatic pause]
Reel 3: HEART

⚡ PLOT TWIST ⚡
```

### How It Works
The player who rolled Three of a Kind chooses:
1. **Which character** is affected (their own or the other player's)
2. **What the twist is** — new information that recolors everything we know about that character

The twist can be something the character **did not know about themselves**, or a **secret they have been hiding the whole time**.

The AI immediately rewrites the end of the current scene around the chosen twist and incorporates it into all future scenes.

No points are awarded for the plot twist scene. The players will start a new version of the scene they were already on. For example if durring the 'Call to Adventure' scene a tripple is rolled, that scene is resolved as a plot twist. Then the game will restart a brand new 'Call to Adventure' scene with new location, obstacle and mad libs. 

### Example Twists

```
1. 🧛 THE VAMPIRE (OR EQUIVALENT)
   "Your character is not entirely human and has been
   hiding it the whole time. Something in this scene
   just gave it away."

2. 🕵️ THE DOUBLE AGENT
   "Your character has been feeding information to the
   villain this entire quest. Not for money. For reasons
   that made sense at the time."

3. 👁️ I SEE DEAD PEOPLE
   "Your character can see and has been talking to
   someone who died. Someone the other character knew."

4. 💍 THE SECRET FAMILY
   "Your character is married. Or was. Recently enough
   that it absolutely matters right now."

5. 🎭 I KNOW WHO YOU REALLY ARE
   "Your character has known exactly who the other
   character is since the moment they met. Everything
   since then has been deliberate."

6. ⏰ THE TIME TRAVELER
   "Your character has lived this moment before. They
   know how the last version of this story ended.
   It ended badly."

7. 🩸 THE BLOODLINE
   "Your character just discovered — or finally admits —
   that they are directly related to the villain. Or the
   person the quest is about."

8. 📜 THE DEAL THEY MADE
   "Your character made a deal before the story started.
   The cost is now coming due. Tonight. Right now."

9. 🪞 THE IMPOSTER
   "Your character is not who they said they were. The
   real version of this person exists somewhere. Your
   character took their place for a reason that felt
   justified."

10. 💀 THEY CAUSED IT
    "The inciting incident — the thing that started this
    whole quest — your character caused it. They have
    known this since Scene 1."
```

### What Makes a Good Twist
Every twist should do three things:
- **Recolor the past** — everything before this moment now means something different
- **Create an immediate question** — the chaos is the question the reveal opens, not just the reveal itself
- **Serve the romance** — secrets, betrayals, and hidden identities raise the emotional stakes between the characters

---

## Special Scenes

### The Revelation (Scene 12) — Free Write
Each player privately types **one true thing** their character would say to the other if they weren't afraid. The AI creates a narrative  around what happens in the space between them. No spin. No Mad Libs. Just honesty.

### The Declaration (Scene 14) — Spoken Aloud
Each player speaks their character's final line **out loud, unscripted, in the moment**. Not typed. Not prompted. 

### The Ordeal (Scene 9) — High Stakes
Both options presented to the active player are difficult. There is no safe choice. A failed Ordeal is narratively meaningful — the near miss here is the lowest point of the story. The AI writes it accordingly.

---

## The AI Game Master

The AI GM has full visibility into:
- Both characters' creation answers (including wounds and wants)
- Both players' stats
- The current romance score
- The current plot point scores
- Every scene that has been played
- Any Plot Twists that have been triggered

The AI uses this information to:
- Generate personalized Mad Libs prompts
- Engineer scenes where the Turn On quality appears naturally
- Surface the Secret Flaw at the right dramatic moment
- Calibrate scene difficulty based on stats
- Rewrite scene endings around Plot Twists in real time
- Shape the final Declaration scene toward the most honest ending the players actually built

### AI Narration Principle
The AI never forces an outcome. It steers toward the most interesting version of what the players are already building. The romance score reflects what actually happened — not what the AI wished would happen.

---

## Scoring Summary

```
14 scenes total
Maximum romance score:  14
Maximum plot points:    14 combined

Each scene:
→ 0 or 1 romance points  (shared, goes up on any win)
→ 0 or 1 plot points     (individual, to the winner)
→ 0 or 1+ clues each     (from slot machine icons)

End of game:
→ Romance score determines the ending type
→ Plot points determine the competitive winner
→ Both players win together if romance score ≥ 8
```

---

## Design Pillars

**1. Transparency over surprise in mechanics**
Players always know the stats, the odds, and the stakes before making a choice. The surprise lives in the story, not the rules.

**2. Cooperation and competition serve the same story**
Competing for plot points makes players care about their characters. Cooperating on the romance score makes them care about each other. Both are necessary.

**3. Failure is narrative, not mechanical**
A failed scene produces a near miss, not a dead end. The story always continues. The romance score reflects what was actually built.

**4. The AI serves the players**
The AI GM is an author, not an opponent. It uses everything it knows to make the story more emotionally resonant — not to challenge or block the players.

**5. The most important moments are unscripted**
The Free Write and the Declaration are the emotional heart of the game. They cannot be Mad Libbed or rolled off. They just have to be said.

---

*Document version: 0.1 — Design phase*
*Last updated: May 2026*
