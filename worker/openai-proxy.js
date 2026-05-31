export default {
  async fetch(request, env) {
    const allowedOrigins = new Set([
      "https://justin1horvath.github.io",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "null",
    ]);
    const requestOrigin = request.headers.get("Origin") || "null";
    const allowOrigin = allowedOrigins.has(requestOrigin)
      ? requestOrigin
      : "https://justin1horvath.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const body = await request.json();
    const prompt = body.prompt || "Say hello from the Plot Point AI Game Master.";
    const system = body.system || "You are the AI Game Master for Plot Point.";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || "gpt-5.4-mini",
        instructions: system,
        input: prompt,
        max_output_tokens: body.maxOutputTokens || 300,
      }),
    });

    const data = await response.json();
    const text = extractResponseText(data);

    return new Response(JSON.stringify({ text, data }), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};

function extractResponseText(data) {
  if (typeof data.output_text === "string" && data.output_text.length > 0) {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (typeof part.text === "string" && part.text.length > 0) {
        return part.text;
      }
    }
  }

  return "";
}
