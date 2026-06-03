# Plot Point Worker

Cloudflare Worker for AI generation. The browser app calls this Worker with provider-neutral tasks; the Worker calls the selected AI provider and validates the result with Zod before returning data.

## Setup

Install dependencies from this folder:

```bash
npm install
```

Set the OpenAI secret:

```bash
npx wrangler secret put OPENAI_API_KEY
```

Run locally:

```bash
npm run dev
```

Deploy:

```bash
npm run deploy
```

## Request Shape

```json
{
  "task": "generate_scene",
  "payload": {
    "prompt": "..."
  }
}
```

Supported tasks:

- `generate_character`
- `generate_scene`
