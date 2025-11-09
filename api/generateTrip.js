// api/generateTrip.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MODEL_CONFIGS = {
  "gpt-4o-mini": {
    temperature: 0.7,
    max_completion_tokens: 4096,
  },
  "o4-mini": {
    temperature: 0.65,
    max_completion_tokens: 4096,
  },
};

async function callOpenAIOnce(modelName, prompt, { signal } = {}) {
  const modelConfig = MODEL_CONFIGS[modelName] || MODEL_CONFIGS["gpt-4o-mini"];

  const body = {
    model: modelName,
    response_format: { type: "json_object" },
    temperature: modelConfig.temperature,
    max_completion_tokens: modelConfig.max_completion_tokens,
    top_p: 0.9,
    messages: [
      {
        role: "system",
        content:
          "You are a travel planner that must return ONLY valid JSON (no markdown, no extra text).",
      },
      {
        role: "user",
        content:
          prompt +
          "\n\nReturn ONLY valid JSON. Do not wrap with markdown fences.",
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `OpenAI ${res.status} ${res.statusText}: ${errText.slice(0, 500)}`
    );
  }

  const data = await res.json();

  const text =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
    "";

  return String(text || "").trim();
}

async function callOpenAIWithRetry(prompt) {
  const models = ["gpt-4o-mini", "o4-mini"]; // try fast/cheap first, then fallback if needed
  for (const modelName of models) {
    let attempt = 0;
    let backoff = 700;
    const maxAttempts = modelName === "gpt-4o-mini" ? 3 : 2;

    while (attempt < maxAttempts) {
      attempt++;

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort("request-timeout"), 20000);

      try {
        const out = await callOpenAIOnce(modelName, prompt, {
          signal: ctrl.signal,
        });
        clearTimeout(timeout);
        return out;
      } catch (err) {
        clearTimeout(timeout);

        const msg = String(err.message || err);
        const is429 =
          msg.includes("429") || /rate limit/i.test(msg) || /quota/i.test(msg);
        const is5xx =
          /5\d\d/.test(msg) ||
          /server error/i.test(msg) ||
          /unavailable/i.test(msg);
        const timeouted = /timeout/i.test(msg) || /aborted/i.test(msg);

        if (!(is429 || is5xx || timeouted)) {
          throw err;
        }

        if (attempt >= maxAttempts) {
          console.warn(
            `[generateTrip] ${modelName} failed after ${attempt} attempts:`,
            msg
          );
          break;
        }

        const jitter = backoff * (0.75 + Math.random() * 0.5);
        console.warn(
          `[generateTrip] ${modelName} attempt ${attempt}/${maxAttempts} failed (${msg}). retrying in ~${Math.round(
            jitter
          )}ms`
        );
        await sleep(jitter);
        backoff = Math.min(5000, backoff * 1.7);
      }
    }
  }

  throw new Error("All OpenAI model attempts failed");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (!OPENAI_API_KEY) {
    res.status(500).json({
      error:
        "OPENAI_API_KEY not set. Add it in Vercel Project Settings → Environment Variables.",
    });
    return;
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt' in JSON body" });
      return;
    }

    const aiText = await callOpenAIWithRetry(prompt);

    // Frontend expects { response: { text: async () => <aiText> } }
    // but we only send {text: "..."} here and the FE wraps it.
    res.status(200).json({
      text: aiText,
    });
  } catch (err) {
    console.error("[/api/generateTrip] fatal:", err);
    res.status(500).json({
      error: "AI generation failed",
      detail: String(err.message || err),
    });
  }
}
