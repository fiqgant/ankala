// src/service/AIModel.jsx
import OpenAI from "openai";

// NOTE: Sesuai permintaan, kita TETAP pakai env yang sama:
// VITE_GOOGLE_GEMINI_AI_API_KEY akan diisi OpenAI key-mu.
const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
if (!apiKey)
  console.warn("VITE_GOOGLE_GEMINI_AI_API_KEY (OpenAI key) is missing.");

const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

// ---- helpers ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseRetryAfterMs(err) {
  // coba ambil saran retry dari pesan error OpenAI
  const m = String(err?.message || "").match(/retry after (\d+(?:\.\d+)?) ?s/i);
  if (m) return Math.ceil(parseFloat(m[1]) * 1000);
  return null;
}

function normalizeJson(text) {
  if (!text) return "";
  let s = String(text).trim();
  // buang fence ```json
  s = s
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "");
  return s;
}

async function callOnce(model, prompt, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort("request-timeout"), timeoutMs);
  try {
    const resp = await openai.chat.completions.create(
      {
        model,
        // JSON-only
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 6144,
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
      },
      { signal: ctrl.signal }
    );

    const text =
      resp?.choices?.[0]?.message?.content ??
      resp?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
      "";

    return normalizeJson(text);
  } finally {
    clearTimeout(t);
  }
}

async function callWithRetry(model, prompt, maxRetries = 4) {
  let attempt = 0;
  let delay = 700;

  while (true) {
    try {
      return await callOnce(model, prompt);
    } catch (err) {
      const msg = String(err?.message || err);
      const is429 = /429/.test(msg) || /rate limit/i.test(msg);
      const is5xx = /5\d{2}/.test(msg) || /server error/i.test(msg);
      const timeout = /request-timeout/i.test(msg) || /aborted/i.test(msg);

      if (!(is429 || is5xx || timeout)) {
        // error lain: lempar saja
        throw err;
      }
      if (attempt >= maxRetries) throw err;

      // hormati Retry-After kalau ada
      const retryAfter = parseRetryAfterMs(err);
      const wait =
        retryAfter ??
        Math.min(6000, Math.floor(delay * (0.75 + Math.random() * 0.5)));

      // eslint-disable-next-line no-console
      console.warn(
        `[${model}] retry ${attempt + 1}/${maxRetries} in ~${wait}ms: ${msg}`
      );

      await sleep(wait);
      delay = Math.min(6000, Math.floor(delay * 1.8));
      attempt += 1;
    }
  }
}

// cegah double-click spam
let inFlight = false;

// API kompatibel dengan kode kamu sebelumnya
export const chatSession = {
  sendMessage: async (prompt) => {
    if (inFlight) {
      await sleep(300);
    }
    inFlight = true;
    try {
      // 1) coba model ringan dulu
      try {
        const text = await callWithRetry("gpt-4o-mini", prompt, 3);
        return { response: { text: async () => text } };
      } catch (e1) {
        // 2) fallback ke model reasoning mini
        const text = await callWithRetry("o4-mini", prompt, 4);
        return { response: { text: async () => text } };
      }
    } finally {
      inFlight = false;
    }
  },
};
