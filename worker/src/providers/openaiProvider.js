import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  CharacterResponseSchema,
  validateCharacterResponse,
} from "../schemas/characterSchema.js";
import { SceneResponseSchema } from "../schemas/sceneSchema.js";

// Creates an OpenAI client using the secret stored in the Worker environment.
function createClient(env) {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

// Chooses the configured model, falling back to the default prototype model.
function getModel(env) {
  return env.OPENAI_MODEL || "gpt-5-mini";
}

// Generates structured character data using OpenAI's Zod-backed parser.
export async function generateCharacter(payload, env) {
  const client = createClient(env);
  try {
    const response = await client.responses.parse({
      model: getModel(env),
      instructions:
        payload.system ||
        "You generate structured character data for Plot Point, a two-player romantic storytelling RPG.",
      input: payload.prompt,
      max_output_tokens: payload.maxOutputTokens || 1500,
      text: {
        format: zodTextFormat(CharacterResponseSchema, "plot_point_characters"),
      },
    });

    return validateCharacterResponse(response.output_parsed);
  } catch (error) {
    throw addStructuredOutputHint(error, "character");
  }
}

// Generates structured scene data using OpenAI's Zod-backed parser.
export async function generateScene(payload, env) {
  const client = createClient(env);
  try {
    const response = await client.responses.parse({
      model: getModel(env),
      instructions:
        payload.system ||
        "You generate structured scene data for Plot Point, a two-player romantic storytelling RPG.",
      input: payload.prompt,
      max_output_tokens: payload.maxOutputTokens || 3000,
      text: {
        format: zodTextFormat(SceneResponseSchema, "plot_point_scene"),
      },
    });

    return response.output_parsed;
  } catch (error) {
    throw addStructuredOutputHint(error, "scene");
  }
}

// Adds task context to parsing/schema errors before the Worker returns them.
function addStructuredOutputHint(error, taskName) {
  const message = error?.message || "Structured output failed.";
  return new Error(
    `${taskName} structured output failed: ${message}. If this mentions an unterminated string, the model output was probably truncated; increase max_output_tokens.`
  );
}
