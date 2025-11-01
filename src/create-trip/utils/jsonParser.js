/* -------------------------------------------------
   Safe JSON parser for AI output
   ------------------------------------------------- */
export function safeJsonParseMaybe(text) {
  if (!text) throw new Error("Empty response from AI");
  let raw = String(text);

  // Strip code fences if any
  raw = raw
    .trim()
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "");

  // Normalize weird quotes / nbsp / newlines
  raw = raw
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/[\r\n]+/g, " ");

  // Extract largest balanced {...}
  const extractLargestJson = (s) => {
    const start = s.indexOf("{");
    if (start === -1) return s;
    let inStr = false;
    let esc = false;
    let depth = 0;
    let end = -1;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (!esc && ch === '"') inStr = false;
        esc = ch === "\\" ? !esc : false;
      } else {
        if (ch === '"') {
          inStr = true;
        } else if (ch === "{") {
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
    }
    return end !== -1 ? s.slice(start, end + 1) : s.slice(start);
  };
  raw = extractLargestJson(raw);

  // Remove trailing commas
  raw = raw.replace(/,\s*([}\]])/g, "$1");

  // Replace undefined with null
  raw = raw.replace(/:\s*undefined(\s*[,\}])/g, ": null$1");

  // Remove // and /* */ style comments
  raw = raw
    .replace(/\/\/[^\n\r]*[\n\r]?/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  try {
    return JSON.parse(raw);
  } catch (e1) {
    const last = raw.lastIndexOf("}");
    if (last > 0) {
      const cand = raw.slice(0, last + 1).replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(cand);
    }
    throw e1;
  }
}
