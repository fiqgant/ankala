// /api/geocode.js
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  const {
    q,
    limit = "8",
    addressdetails = "1",
    extratags = "0",
  } = req.query || {};
  if (!q || String(q).trim().length < 2) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(400)
      .json({ error: "Query 'q' is required (min 2 chars)" });
  }

  const params = new URLSearchParams({
    q: String(q),
    format: "json",
    addressdetails: String(addressdetails),
    limit: String(limit),
    extratags: String(extratags),
  });

  try {
    const upstream = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Pakai kontakmu sendiri di bawah ini (policy Nominatim)
          "User-Agent": `Ankala Trip Planner/1.0 (contact: ${
            process.env.SUPPORT_EMAIL || "support@ankala.app"
          })`,
          "Accept-Language": "en",
        },
      }
    );

    const status = upstream.status;
    const data = await upstream.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (!upstream.ok) {
      return res.status(status).send(data);
    }
    return res.status(200).send(data);
  } catch (err) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(500)
      .json({ error: "Upstream error", details: String(err) });
  }
}
