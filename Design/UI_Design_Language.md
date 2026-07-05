# Plot Point UI Design Language

## Creative direction

Plot Point should feel like a private, beautifully bound volume opened for two people: sophisticated, intimate, and quietly theatrical. The interface combines minimalist product design with restrained Art Nouveau ornament and a trace of Art Deco structure.

The reference image contributes its midnight field, fine metallic linework, nested borders, symmetrical framing, high-contrast serif typography, and subtle crosshatched texture. The app should adapt those ideas rather than reproduce the cover literally. Ornament frames important moments; it does not compete with the story.

### Design principles

1. **The story is the luxury.** Text and choices remain the visual focus.
2. **Ornament marks significance.** Filigree appears at scene openings, reveals, act transitions, and key scores—not around every control.
3. **Romance through warmth, not cliché.** Use candlelit gold, parchment, and a controlled wine-rose accent instead of hearts and pink decoration.
4. **Symmetry for ceremony; asymmetry for play.** Shared reveals and headings may be centered and formal. Forms, instructions, and gameplay remain left-aligned and direct.
5. **Tactile but quiet.** Fine paper grain and engraved lines add atmosphere without reducing readability.

## Visual vocabulary

### Color palette

| Token | Value | Use |
| --- | --- | --- |
| `--ink-950` | `#07091F` | Page background; deepest midnight navy |
| `--ink-900` | `#0D102B` | Main app surface |
| `--ink-800` | `#151936` | Raised panels and input surfaces |
| `--gold-500` | `#C9A45F` | Borders, icons, active ornament |
| `--gold-300` | `#E0C98D` | Highlighted linework and small labels |
| `--ivory-100` | `#F4EFE6` | Primary text and prominent headings |
| `--ivory-300` | `#D7CFC2` | Body copy and helper text |
| `--rose-500` | `#A64D68` | Primary actions and romantic emphasis |
| `--rose-300` | `#D58A9E` | Hover, focus, and emotional highlights |
| `--success-400` | `#76A58E` | Success feedback only |
| `--danger-400` | `#C66A6A` | Errors and destructive actions only |

Gold is a line and light color, not a large fill. Rose should occupy less than roughly 10% of a screen. Use ivory instead of pure white and midnight navy instead of black.

### Typography

**Display and scene titles:** Cormorant Garamond, `600` weight. Its high contrast, expressive curves, and literary character provide the romantic voice. Use title case; reserve all caps for very short labels.

**Interface and body:** Source Sans 3, `400` and `600`. It keeps longer story text, forms, scores, and instructions clear on phones. If external font loading is unavailable, fall back to Georgia for display and system UI sans-serif for body.

Suggested scale:

| Role | Size / line height | Treatment |
| --- | --- | --- |
| App title | `clamp(2.5rem, 8vw, 4.5rem) / 0.95` | Display serif, slight negative tracking |
| Scene title | `clamp(2rem, 6vw, 3.25rem) / 1.05` | Display serif |
| Section heading | `1.5rem / 1.15` | Display serif |
| Body/story | `1.0625rem / 1.65` | Sans; optional serif for long reveal prose |
| UI label | `0.75rem / 1.2` | Sans, uppercase, `0.14em` tracking |
| Helper text | `0.9375rem / 1.5` | Sans, muted ivory |

Avoid condensed novelty typefaces for functional text. Never set paragraphs in uppercase.

### Texture and light

- Use a nearly invisible diagonal crosshatch or paper grain over midnight surfaces at `2–4%` opacity.
- Add a soft radial glow behind ceremonial content, like light falling across dark paper.
- Keep shadows broad and low-contrast. Surfaces should feel layered like paper, not glossy glass.
- Avoid faux-metal gradients, heavy noise, bevels, lens flares, and bright neon glows.
- Texture must disappear behind inputs and dense text areas to protect legibility.

### Filigree

Filigree is custom vector line art built from curling stems, buds, fans, and tapered leaves. It should feel drawn with a fine engraving pen.

- Use `1–1.5px` gold strokes with rounded joins and occasional tapered filled details.
- Build a small reusable set: corner flourish, horizontal divider, scene medallion, and full ceremonial frame.
- Prefer mirrored pairs and generous negative space.
- Use the full frame only for the opening screen, act transitions, the Declaration, and the ending.
- Use corner flourishes or a divider on ordinary panels; never both by default.
- At narrow widths, simplify flourishes rather than shrinking them into visual noise.
- Ornament is always decorative (`aria-hidden="true"`) and never carries essential meaning.

## Icon language

Icons should resemble small engraved symbols from the same book:

- Monoline SVGs with `1.5px` strokes, rounded terminals, and restrained organic curves.
- Use simple silhouettes inside an arch, oval, diamond, or botanical enclosure when emphasis is needed.
- Pair unfamiliar icons with text labels; do not rely on icons alone for gameplay actions.
- Favor symbols such as a flur de li, heart, diamond, spark, rose stem, key, compass star, laurel, moons, and interlocking rings.
- Use one icon family throughout. Avoid emoji, chunky filled icons, cartoon hearts, and mixed stroke weights.

Suggested score marks: a small rose or intertwined-stem symbol for Romance Score and a four-point narrative star for Plot Points.

## Component direction

### App shell and navigation

Use one centered reading column, approximately `720px` wide, with `20–24px` mobile gutters. A fine outer border may frame large screens; on phones, let the frame meet the safe area with simplified corners. Navigation stays visually quiet and gives the current scene prominence.

### Panels and cards

Panels use `--ink-900` or `--ink-800`, a fine translucent gold border, and a restrained `2–4px` corner radius. Reserve nested/double borders for ceremonial cards. Everyday cards should have one border and ample padding.

### Buttons

- Primary: wine-rose fill, ivory label, fine rose-gold edge.
- Secondary: transparent midnight fill with gold border and ivory label.
- Tertiary: text action with a short botanical underline or arrow.
- Use a minimum `44px` touch height, readable labels, and a visible rose/gold focus ring.
- Hover may brighten the border and lift by `1px`; press returns it to the page. Avoid arcade-like depth and large drop shadows.

### Inputs

Inputs resemble clean writing fields on dark paper: solid midnight surface, single muted-gold rule, ivory text, and rose focus state. Labels sit above fields. Decorative flourishes never touch form controls or validation messages.

### Scoreboard

Treat the scoreboard as a compact chapter header rather than a separate dashboard. Romance Score receives the shared central position. Player Plot Points sit symmetrically on either side when width allows and stack clearly on small screens. Changes may trigger a brief gold line shimmer or unfurling divider, with a reduced-motion fallback.

### Scene reveals

This is the most literary screen. Use a scene number kicker, large serif scene title, a small ornamental divider, then highly readable prose. Keep line length around `55–70` characters. Introduce more elaborate framing only at act openings and climactic scenes.

### Private/pass-device screens

These should feel intimate and discreet: less ornament, stronger instructions, one obvious action, and generous blank space. A small closed-bud or keyhole motif can signal privacy without becoming a literal security indicator.

### Debug and administrative UI

AI logs and development controls should visually recede. Keep them outside the primary story frame or behind a disclosure so they do not disturb the romantic atmosphere.

## Motion

Motion should feel like a page, curtain, or line drawing itself:

- `150–220ms` for controls and focus feedback.
- `350–500ms` for scene transitions and ornamental reveals.
- Use opacity, a few pixels of vertical movement, and subtle SVG stroke drawing.
- No bouncing, spinning, confetti, or constant ambient motion.
- Honor `prefers-reduced-motion`; the interface must remain complete without animation.

## Accessibility guardrails

- Maintain WCAG AA contrast for all functional text and controls.
- Gold on midnight is suitable for large text, borders, and decoration; use ivory for small body copy.
- Never communicate player, score, validation, or game state through color alone.
- Keep visible keyboard focus, logical heading order, semantic controls, and `44px` touch targets.
- Decorative texture must not reduce text contrast or produce moiré at common mobile resolutions.
- Long story passages should support browser zoom and user font scaling without clipping the frame.

## Balance test

A successful Plot Point screen should pass three checks:

1. With all ornament removed, it remains a clear and elegant product interface.
2. With ornament restored, the eye still reaches the story or action first.
3. It feels romantic because of intimacy, rhythm, and craft—not because it is covered in hearts.

## Initial asset set

Create these reusable SVG assets before expanding the system:

1. Fleur de li for opening splash screen
2. Corner flourish in full and simplified mobile variants.
3. Horizontal botanical divider in short and wide variants.
4. Romance Score rose/intertwined-stem icon.
5. Plot Point four-point star icon.
6. Ceremonial frame for opening, act transition, Declaration, and ending screens.
7. Small privacy/keyhole motif for pass-device screens.
8. Stats icon for 'heart' as a heart with thin boarder 
9. Stats icon for 'wit' as a diamond
10. Stats icon for 'guts' as a ornamental shield or crest
11. Stats icon for "Charm" as a rose
12. Icon for 'wild card' is a fleur de li
13. icon for 'clue' is a magnifying glass 

All assets should use `currentColor` where practical so gold, rose, and muted states can be controlled by CSS.

## MVP screen inventory

The MVP is a single-device experience. Some entries below are different states of the same screen shell rather than separate routes. Private input screens prioritize discretion; shared screens prioritize legibility when the device is placed between both players.

### 1. Title / opening screen

The opening should feel like the title page of a beautifully bound book.

- A fleur-de-lis is the central logo mark, with the **Plot Points** wordmark beneath or integrated into it.
- Primary action: **Start Adventure**.
- Secondary actions: **Find Out More** and **Settings**.
- **Find Out More** and **Settings** are visible but deferred until after the MVP. They should be disabled or clearly labeled “Coming soon” rather than leading to empty screens.
- This screen may use the full ceremonial frame and the richest version of the filigree system.

### 2. Create character screen

Each player completes the existing four questions privately. All four questions appear together on one page:

1. What do you do?
2. What is your gift?
3. What is your turn on?
4. What do you want more than anything?

- The screen clearly identifies which player is creating a character.
- A short privacy instruction tells the player not to reveal their answers.
- Fields are stacked in one column, with enough spacing to distinguish the questions without making the form feel long.
- The primary action submits the complete character.
- Validation appears beside the relevant field and does not disclose or restate private answers after handoff.
- The same screen is reused for Player 1 and Player 2, with a handoff state between them.

### 3. Character reveal screen

This is a shared, side-by-side reveal of both generated characters.

Each character card displays:

- Name
- Role
- Gift / skill
- Character description
- Guts, Charm, Wit, and Heart stats

On wide screens, the cards sit side by side with equal visual weight. On narrow phones, they stack while retaining clear Player 1 and Player 2 labels. The reveal should feel ceremonial but leave enough quiet space for both players to read. A single primary action begins the story.

### 4. Shared scene shell

All gameplay scene states use the same persistent shell so players always understand the characters, scores, active player, and place in the story.

#### Expandable character bar

- Appears at the top of every gameplay screen.
- Shows both characters’ names, descriptions, and stats.
- In its expanded state, it occupies no more than 20% of the viewport height.
- Players can collapse and reopen it at any time.
- Its collapsed state retains both character names and a clear expand control.
- The toggle uses a descriptive accessible label such as “Show character details” or “Hide character details.”
- On short screens or when the keyboard opens, the bar should default to collapsed so it does not crowd out the active task.

#### Persistent game-status bar

A thin status bar sits immediately below the character bar and remains visible throughout every scene. It displays, in order:

1. Player 1 Plot Points
2. Romance Score
3. Active Player
4. Scene number
5. Player 2 Plot Points

- The compact state uses icons with concise numeric values or identifiers.
- The expanded state pairs each icon with its text label.
- Players can toggle between compact and expanded states.
- The compact state must retain accessible names and must not communicate meaning through icons or color alone.
- Romance Score holds the visual center; both players’ points balance the ends of the bar.
- The status bar may remain sticky while scene content scrolls.

#### Scene footer

At the bottom of every gameplay screen, a small, discreet horizontal filigree divider frames the words **Plot Points**. It is decorative, low contrast, and never competes with the current action.

### 4A. Mad Libs input screen

This private scene state gathers the active ingredients used to generate the scene.

- Scene number and scene name
- Short scene description or premise
- Clear identification of the player currently adding ingredients
- The Mad Libs prompts and input fields assigned to that player
- Primary action: **Submit Ingredients**

The submission action should describe the result rather than use the ambiguous label “Input Ingredients.” After submission, the app advances to a handoff screen when another player must contribute privately; otherwise it advances to generation or the scene output.

### 4B. Hand-off screen

This privacy screen tells the players exactly who should receive the device next.

- Large instruction naming the next player
- A reminder that the other player should look away
- No private answers or generated spoilers remain visible
- One obvious primary action: **I’m Ready**

The screen should be visually simple and readable at arm’s length. The private keyhole or closed-bud motif may be used here.

### 4C. Scene output and choice screen

This shared state presents the generated story and the active player’s decision.

- Scene number and scene name
- Instruction naming who should read the scene aloud
- Generated scene text with a comfortable literary line length
- A decision prompt directed to the active player
- Two clearly differentiated choices
- Primary actions: **Take Action 1** and **Take Action 2**, replaced by concise descriptions of the actual actions whenever the generated response provides suitable labels
- Roll-off area at the bottom of the scene

The roll-off area will eventually contain the slot-machine mechanic, relevant character stat, reel result, and scoring outcome. Because the roll-off mechanic is not implemented for the MVP, its visual region and data contract may be reserved, but it should not present a control that appears functional. The initial playable flow may resolve the selected action without an interactive roll-off until that mechanic is added.

## MVP flow

```text
Title / Opening
    → Player 1 Character Creation
    → Hand-off
    → Player 2 Character Creation
    → Character Reveal
    → Mad Libs Input
    → Hand-off when another private contribution is required
    → Scene Output and Choice
    → Repeat scene states through the story
```

The title, character creation, character reveal, hand-off, Mad Libs, and scene output states are required for the MVP. Find Out More, Settings, and the interactive slot-machine roll-off are explicitly deferred.
