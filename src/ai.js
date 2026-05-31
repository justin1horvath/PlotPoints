const WORKER_URL = "https://red-art-b4dc.mr-justin-horvath.workers.dev";

export async function getAIReply(prompt) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      system: "You are the AI Game Master for Plot Point, a romantic two-player storytelling RPG. Keep test responses brief.",
      prompt,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.data?.error?.message || "OpenAI request failed.");
  }

  if (!result.text) {
    console.warn("OpenAI response did not include text:", result.data);
    return "OpenAI responded, but no text was returned. Check the browser console for the raw response.";
  }

  return result.text;
}
