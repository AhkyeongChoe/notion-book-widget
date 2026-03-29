export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing KAKAO_REST_API_KEY" });
  }

  const url =
    "https://dapi.kakao.com/v3/search/book" +
    `?query=${encodeURIComponent(q)}` +
    "&size=10" +
    "&sort=accuracy" +
    "&target=title";

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (error) {
    console.error("searchBooks error:", error);
    return res.status(500).json({ error: "Search failed" });
  }
}