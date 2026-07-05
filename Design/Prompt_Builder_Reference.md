# Prompt Builder Reference

This document explains how the scene-generation prompt is assembled, where each part is defined, and where each value comes from.

## High-Level Flow

Scene generation starts in `src/sceneTypes/madlibsScene.js`.

1. The current scene blueprint is loaded from `src/sceneBlueprints.js`.
2. The app assigns Mad Lib prompts from that blueprint.
3. Each player answers their assigned Mad Lib prompts.
4. `requestSceneData()` calls `buildScenePrompt()` in `src/promptBuilder.js`.
5. `src/ai.js` sends the prompt to the Cloudflare Worker.
6. `worker/src/providers/openaiProvider.js` sends the prompt to OpenAI.
7. The Worker validates the AI response with `worker/src/schemas/sceneSchema.js`.
8. The browser stores the response in scene state and story memory.

## NEW Scene Prompt Shape

This is the description of how the new scene prompt is created in `src/promptBuilder.js` by `buildScenePrompt()`. 

The *italic* parts are additions. The ~~strike out~~ parts are removeals from the OLD prompt shape.

```text
Write Scene [scene number] for Plot Point...

SCENE TASK
Scene name: ...
Act: ...
Task: ...
Tone: ...

PROSE STYLE
- Plain, concrete narration rules
- Prohibited decorative language
- Behavioral guidance for romance and tension

SCENE CONSTRAINTS
- ...
  
STORY SO FAR
...

ACTIVE PLAYER
Player ... is the active player for this scene.



OUTPUT REQUIREMENTS
...
```


## OLD Scene Prompt Shape

The scene prompt is created in `src/promptBuilder.js` by `buildScenePrompt()`.

It currently has this structure:

```text
Write Scene [scene number] for Plot Point...

SCENE TASK
Scene name: ...
Act: ...
Task: ...
Tone: ...

PROSE STYLE
- Plain, concrete narration rules
- Prohibited decorative language
- Behavioral guidance for romance and tension

SCENE CONSTRAINTS
- ...

ACTIVE PLAYER
Player ... is the active player for this scene.

STORY SO FAR
...

OUTPUT REQUIREMENTS
...
```

## Prompt Sections

### Opening Instructions

Defined in:

```text
src/promptBuilder.js
```

Source type:

```text
Hardcoded app prompt text
```

Purpose:

These instructions tell the model the overall writing style: plain language, short concrete sentences, use only relevant details, and preserve the scene's core function.

### Scene Name

Prompt field:

```text
Scene name
```

Defined in:

```text
src/sceneBlueprints.js
```

Source type:

```text
Hardcoded per scene
```

Example:

```js
name: "Cold Open"
```

### Act

Prompt field:

```text
Act
```

Defined in:

```text
src/sceneBlueprints.js
```

Source type:

```text
Hardcoded per scene
```

Example:

```js
act: 1
```

### Task

Prompt field:

```text
Task
```

Defined in:

```text
src/sceneBlueprints.js
```

Resolved in:

```text
src/promptBuilder.js
```

Source type:

```text
Hardcoded scene description with placeholders
```

The `description` field in a scene blueprint is the main creative instruction for that scene.

Example:

```js
description: `Set the scene by describing how {madlibs.location} fits into {story.setting}.`
```

Before the prompt is sent, `resolveSceneDescription()` replaces placeholders like `{madlibs.location}` with actual values.

## Description Placeholders

Scene descriptions can reference several namespaces.

### Story Placeholders

Example:

```text
{story.setting}
{story.plot}
{story.antagonist}
```

Defined in:

```text
src/state.js
```

Created by:

```js
createDefaultStoryDirection()
```

Source type:

```text
Hardcoded app defaults for now
```

Available story values:

```js
genre
setting
antagonist
plot
romanceDynamic
```

These are stored in:

```js
state.storyDirection
```

### Active Player Placeholders

Example:

```text
{activePlayer.name}
{activePlayer.role}
{activePlayer.gift}
{activePlayer.goal}
```

Defined in:

```text
src/state.js
src/characters.js
src/sceneTypes/madlibsScene.js
```

Resolved in:

```text
src/promptBuilder.js
```

Source types vary by field:

```text
User input: role, gift, turnOn, want
LLM-generated during character creation: name, physicalDetail, stats
LLM-generated during scene generation: goal
App state: player number / active player identity
```

Available active player values:

```js
name
role
gift
physicalDetail
goal
stats
turnOn
want
```

### Other Player Placeholders

Example:

```text
{otherPlayer.name}
{otherPlayer.turnOn}
{otherPlayer.goal}
```

These use the same fields as `activePlayer`, but for the non-active player.

The non-active player is found in:

```text
src/promptBuilder.js
```

by:

```js
getOtherPlayer(players, activePlayerNumber)
```

### Mad Lib Placeholders

Example:

```text
{madlibs.location}
{madlibs.intrigue}
```

Prompt definitions are in:

```text
src/sceneBlueprints.js
```

User answers are collected in:

```text
src/sceneTypes/madlibsScene.js
```

Source type:

```text
User input during scene play
```

Important behavior:

`createMadLibAssignments()` reads the blueprint's `activePlayerPrompts` and `otherPlayerPrompts` lists, then assigns those exact prompt keys to the current active player and the other player. The function validates that every `{madlibs.key}` placeholder in the scene description or ordered beats appears in one of those lists. It also requires exactly one `inputRoles` entry for every Mad Lib prompt.

Each `inputRoles` entry declares whether an input is `plot-driving` or
`supporting` and describes its one permitted job. Supporting inputs may add
setting, dialogue, or texture, but must not redirect the plot or create an
unrelated thread.

Each blueprint's `beats` array provides the required causal order for the
scene. `narrativeParagraphs` controls the requested read-aloud length, avoiding
global paragraph rules that conflict with individual scenes.

### Memory Placeholders

The current `src/promptBuilder.js` exposes `{memory.*}` placeholders from `state.storyMemory`. Scene descriptions can reference compact values such as `{memory.currentSituation}`, `{memory.relationshipState}`, `{memory.unresolvedMysteries}`, and `{memory.activeThreats}`.

### Per-Scene Character Context

Each blueprint controls whether romance context and character details enter its
prompt. Use `characterDetails()` to separate facts the scene may reveal from
private facts that should influence the scene only as subtext:

```js
promptContext: {
  includeRomance: true,
  activePlayer: characterDetails({
    reveal: ["name", "role"],
    subtext: ["goal", "gift"],
  }),
  otherPlayer: null,
}
```

Set either player to `null` to omit that character's detail block. Any field
left out of both lists is not included in that block. Available fields are
`name`, `role`, `gift`, `physicalDetail`, `goal`, `stats`, `turnOn`, and `want`.
Scene-description placeholders remain independently controlled by the scene
blueprint.

Set `includeRomance` to `false` to omit the campaign romance dynamic and
current relationship state. The scene-summary paragraph is always included.

## Scene Constraints

Prompt field:

```text
SCENE CONSTRAINTS
```

Defined in:

```text
src/sceneBlueprints.js
```

Source type:

```text
Hardcoded per scene
```

Example:

```js
constraints: [
  "Create a brief teaser scene, not the full beginning of the plot.",
]
```

Formatted by:

```js
formatList()
```

in:

```text
src/promptBuilder.js
```

## Active Player

Prompt field:

```text
ACTIVE PLAYER
```

Defined in:

```text
src/state.js
```

Used in:

```text
src/promptBuilder.js
```

Source type:

```text
App state
```

The active player is stored in:

```js
state.activePlayer
```

It is originally selected by the app and later can be changed by game mechanics.

## Story So Far

Prompt field:

```text
STORY SO FAR
```

Formatted in:

```text
src/promptBuilder.js
```

Stored in:

```text
src/state.js
```

Updated in:

```text
src/sceneTypes/madlibsScene.js
```

Source type:

```text
LLM-generated after each scene
```

After each generated scene, the app saves:

```js
summary
emotionalShift
unresolvedThreads
importantFacts
romanceBeat
```

These values are returned by the LLM in `storyLogEntry`.

The `STORY SO FAR` prompt block sends only each completed scene's `summary`,
labeled with its scene number and name. The other `storyLogEntry` values remain
stored for future features but are not included in this block.

Separate optional blocks may supply the campaign romance dynamic, current
`storyMemory.relationshipState`, and only the character details selected by
the current blueprint.

The app also adds:

```js
mechanicalResult
```

Source type for `mechanicalResult`:

```text
App-generated placeholder values for future game mechanics
```

## Output Requirements

Defined in:

```text
src/promptBuilder.js
```

Source type:

```text
Hardcoded app prompt text
```

Purpose:

This section tells the model to return strict JSON, use first-person present tense, follow the blueprint's paragraph count, plan the scene before writing prose, update goals only for participating characters, and create compact story memory.

## Required AI Response Shape

Defined in:

```text
worker/src/schemas/sceneSchema.js
```

Source type:

```text
Hardcoded app schema
```

The LLM must return:

```js
title
location
setup
goals.player1
goals.player2
scenePlan.purpose
scenePlan.activeObjective
scenePlan.otherObjective
scenePlan.conflict
scenePlan.beats
scenePlan.endingChange
narrative
storyLogEntry.summary
storyLogEntry.emotionalShift
storyLogEntry.unresolvedThreads
storyLogEntry.importantFacts
storyLogEntry.romanceBeat
```

The Worker validates this shape before returning data to the browser.

## Where The Prompt Is Sent

Browser request is made in:

```text
src/ai.js
```

Worker route is handled in:

```text
worker/src/index.js
```

OpenAI call is made in:

```text
worker/src/providers/openaiProvider.js
```

The scene prompt is sent as:

```js
input: payload.prompt
```

The model is:

```js
env.OPENAI_MODEL || "gpt-5-mini"
```

## Value Source Summary

| Value                         | Where Defined                                                          | Where Used             | Source                     |
| ----------------------------- | ---------------------------------------------------------------------- | ---------------------- | -------------------------- |
| `blueprint.name`              | `src/sceneBlueprints.js`                                               | `src/promptBuilder.js` | Hardcoded app data         |
| `blueprint.act`               | `src/sceneBlueprints.js`                                               | `src/promptBuilder.js` | Hardcoded app data         |
| `blueprint.description`       | `src/sceneBlueprints.js`                                               | `src/promptBuilder.js` | Hardcoded prompt template  |
| `blueprint.tone`              | `src/sceneBlueprints.js`                                               | `src/promptBuilder.js` | Hardcoded app data         |
| `blueprint.constraints`       | `src/sceneBlueprints.js`                                               | `src/promptBuilder.js` | Hardcoded app data         |
| `story.genre`                 | `src/state.js`                                                         | `src/promptBuilder.js` | Hardcoded app default      |
| `story.setting`               | `src/state.js`                                                         | `src/promptBuilder.js` | Hardcoded app default      |
| `story.antagonist`            | `src/state.js`                                                         | `src/promptBuilder.js` | Hardcoded app default      |
| `story.plot`                  | `src/state.js`                                                         | `src/promptBuilder.js` | Hardcoded app default      |
| `story.romanceDynamic`        | `src/state.js`                                                         | `src/promptBuilder.js` | Hardcoded app default      |
| `activePlayer.role`           | `src/characters.js` / `src/state.js`                                   | `src/promptBuilder.js` | User input                 |
| `activePlayer.gift`           | `src/characters.js` / `src/state.js`                                   | `src/promptBuilder.js` | User input                 |
| `activePlayer.turnOn`         | `src/characters.js` / `src/state.js`                                   | `src/promptBuilder.js` | User input                 |
| `activePlayer.want`           | `src/characters.js` / `src/state.js`                                   | `src/promptBuilder.js` | User input                 |
| `activePlayer.name`           | `worker/src/schemas/characterSchema.js` / `src/characters.js`          | `src/promptBuilder.js` | LLM-generated              |
| `activePlayer.physicalDetail` | `worker/src/schemas/characterSchema.js` / `src/characters.js`          | `src/promptBuilder.js` | LLM-generated              |
| `activePlayer.stats`          | `worker/src/schemas/characterSchema.js` / `src/characters.js`          | `src/promptBuilder.js` | LLM-generated              |
| `activePlayer.goal`           | `worker/src/schemas/sceneSchema.js` / `src/sceneTypes/madlibsScene.js` | `src/promptBuilder.js` | LLM-generated after scenes |
| `madlibs.*`                   | `src/sceneBlueprints.js`                                               | `src/promptBuilder.js` | User input during scene    |
| `storyLog.summary`            | `worker/src/schemas/sceneSchema.js` / `src/sceneTypes/madlibsScene.js` | `src/promptBuilder.js` | LLM-generated after scenes |
| `storyLog.emotionalShift`     | `worker/src/schemas/sceneSchema.js` / `src/sceneTypes/madlibsScene.js` | `src/promptBuilder.js` | LLM-generated after scenes |
| `storyLog.unresolvedThreads`  | `worker/src/schemas/sceneSchema.js` / `src/sceneTypes/madlibsScene.js` | `src/promptBuilder.js` | LLM-generated after scenes |
| `storyLog.importantFacts`     | `worker/src/schemas/sceneSchema.js` / `src/sceneTypes/madlibsScene.js` | `src/promptBuilder.js` | LLM-generated after scenes |
| `storyLog.romanceBeat`        | `worker/src/schemas/sceneSchema.js` / `src/sceneTypes/madlibsScene.js` | `src/promptBuilder.js` | LLM-generated after scenes |
