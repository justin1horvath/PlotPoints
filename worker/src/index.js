import { generateCharacter, generateScene } from "./providers/openaiProvider.js";

const ALLOWED_ORIGINS = new Set([
  "https://justin1horvath.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "null",
]);

export default {
  // Handles every HTTP request that reaches the Cloudflare Worker.
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error: "Method not allowed." },
        405,
        corsHeaders
      );
    }

    try {
      const body = await request.json();
      const data = await handleGenerateRequest(body, env);
      return jsonResponse({ ok: true, data }, 200, corsHeaders);
    } catch (error) {
      console.error("Worker request failed:", error);
      return jsonResponse(
        { ok: false, error: error.message || "Worker request failed." },
        500,
        corsHeaders
      );
    }
  },
};

// Routes provider-neutral browser requests to the selected AI provider adapter.
async function handleGenerateRequest(body, env) {
  const payload = body.payload || {};

  switch (body.task) {
    case "generate_character":
      return generateCharacter(payload, env);
    case "generate_scene":
      return generateScene(payload, env);
    default:
      throw new Error(`Unknown AI task: ${body.task}`);
  }
}

// Builds CORS headers for local testing and the GitHub Pages origin.
function getCorsHeaders(request) {
  const requestOrigin = request.headers.get("Origin") || "null";
  const allowOrigin = ALLOWED_ORIGINS.has(requestOrigin)
    ? requestOrigin
    : "https://justin1horvath.github.io";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Sends a consistent JSON envelope back to the browser app.
function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
