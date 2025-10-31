// src/service/AIModel.jsx

// Frontend-safe AI client.
// We DO NOT call OpenAI from the browser anymore.
// We just call our own backend endpoint /api/generateTrip.
// The rest of the app (CreateTrip etc.) can keep using chatSession.sendMessage(prompt)
// with the same interface as before.

async function callBackendGenerateTrip(prompt) {
  const resp = await fetch("/api/generateTrip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("[AIModel] /api/generateTrip failed:", resp.status, errText);
    throw new Error(
      `AI backend failed with status ${resp.status}: ${errText || "no body"}`
    );
  }

  // Serverless returns { text: "<AI JSON string>" }
  const data = await resp.json();
  if (!data || typeof data.text !== "string") {
    throw new Error("AI backend returned invalid payload");
  }
  return data.text;
}

// tiny anti-double-click guard
let inFlight = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const chatSession = {
  sendMessage: async (prompt) => {
    if (inFlight) {
      await sleep(300);
    }
    inFlight = true;
    try {
      const text = await callBackendGenerateTrip(prompt);

      return {
        response: {
          text: async () => text,
        },
      };
    } finally {
      inFlight = false;
    }
  },
};
