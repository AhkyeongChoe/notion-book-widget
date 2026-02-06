export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const book = req.body;

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parent: {
          database_id: process.env.DATABASE_ID
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: book.title || "제목 없음"
                }
              }
            ]
          },
          Authors: {
            rich_text: [
              {
                text: {
                  content: book.authors || ""
                }
              }
            ]
          },
          Publisher: {
            rich_text: [
              {
                text: {
                  content: book.publisher || ""
                }
              }
            ]
          },
          Published: {
            rich_text: [
              {
                text: {
                  content: book.publishedDate || ""
                }
              }
            ]
          }
        },
        children: book.thumbnail
          ? [
              {
                object: "block",
                type: "image",
                image: {
                  type: "external",
                  external: {
                    url: book.thumbnail
                  }
                }
              }
            ]
          : []
      })
    });

    const data = await notionRes.json();

    if (!notionRes.ok) {
      console.error("Notion error:", data);
      return res.status(notionRes.status).json(data);
    }

    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}