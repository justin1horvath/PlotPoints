import { recordAiLogEntry } from "./aiLog.js";

const WORKER_URL = "https://red-art-b4dc.mr-justin-horvath.workers.dev";

// Sends a provider-neutral AI task to the Cloudflare Worker.
export async function callAI(task, payload = {}) {
  const requestStartedAt = new Date().toISOString();
  let responseWasLogged = false;
  const requestBody = {
    task,
    payload,
  };

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    recordAiLogEntry({
      task,
      status: response.ok && result.ok ? "success" : "error",
      requestStartedAt,
      request: requestBody,
      response: {
        httpStatus: response.status,
        body: result,
      },
    });
    responseWasLogged = true;

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
  } catch (error) {
    if (!responseWasLogged) {
      recordAiLogEntry({
        task,
        status: "network_or_parse_error",
        requestStartedAt,
        request: requestBody,
        error: error.message,
      });
    }
    throw error;
  }
}
