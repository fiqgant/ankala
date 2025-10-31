export default async function handler(req, res) {
  // Hanya GET
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
      return res.status(200).json([]); // balikin array kosong aja
    }

    const params = new URLSearchParams({
      q: q.toString(),
      format: "json",
      addressdetails: "1",
      limit: "8",
      extratags: "0",
    });

    const upstream = await fetch(
      "https://nominatim.openstreetmap.org/search?" + params.toString(),
      {
        headers: {
          // Penting: identify yourself sesuai policy nominatim
          "User-Agent": "AnkalaTripPlanner/1.0 (contact@ankala.id)",
          "Accept-Language": "en",
        },
      }
    );

    if (!upstream.ok) {
      console.error("[osm-search] upstream status", upstream.status);
      return res
        .status(500)
        .json({ error: "Upstream failed " + upstream.status });
    }

    const data = await upstream.json();

    // CORS header (sebenernya ga wajib kalau FE sama origin,
    // tapi aman buat debugging/local)
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    console.error("[osm-search] error", err);
    return res.status(500).json({ error: "Internal proxy error" });
  }
}
