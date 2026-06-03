const WORKER_URL = "https://red-art-b4dc.mr-justin-horvath.workers.dev";

// Sends a provider-neutral AI task to the Cloudflare Worker.
export async function callAI(task, payload = {}) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task,
      payload,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result?.data?.error?.message || "Worker request failed.");
  }

  if (result.ok === undefined) {
    console.error("Unexpected Worker response:", result);
    throw new Error(
      "Worker returned the old response format. Deploy the Wrangler/Zod Worker before testing again."
    );
  }

  if (!result.ok) {
    throw new Error(result.error || "AI request failed.");
  }

  return result.data;
}
