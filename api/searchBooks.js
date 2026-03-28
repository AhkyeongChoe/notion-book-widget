export default async function handler(req, res) {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing GOOGLE_BOOKS_API_KEY" });
  }

  try {
    const url =
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}` +
      `&maxResults=10&key=${apiKey}`;

    const googleRes = await fetch(url);
    const data = await googleRes.json();

    return res.status(googleRes.status).json(data);
  } catch (error) {
    console.error("searchBooks error:", error);
    return res.status(500).json({ error: "Search proxy failed" });
  }
}