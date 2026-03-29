export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing KAKAO_REST_API_KEY" });
  }

  async function searchKakao(target) {
    const url =
      "https://dapi.kakao.com/v3/search/book" +
      `?query=${encodeURIComponent(q)}` +
      "&size=10" +
      "&sort=accuracy" +
      `&target=${target}`;

    const r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data?.msg || data?.error || `Kakao API error: ${r.status}`);
    }

    return data.documents || [];
  }

  try {
    const [titleDocs, personDocs] = await Promise.all([
      searchKakao("title"),
      searchKakao("person"),
    ]);

    const merged = [...titleDocs, ...personDocs];

    const unique = [];
    const seen = new Set();

    for (const book of merged) {
      const key = `${book.isbn || ""}__${book.title || ""}__${book.publisher || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(book);
      }
    }

    return res.status(200).json({
      documents: unique.slice(0, 10),
      searched_target: "title+person",
    });
  } catch (error) {
    console.error("searchBooks error:", error);
    return res.status(500).json({ error: error.message || "Search failed" });
  }
}