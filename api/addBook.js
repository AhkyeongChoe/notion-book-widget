export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const book = req.body;

    if (!book || !book.title) {
      return res.status(400).json({ error: "Invalid book data" });
    }

    const notionHeaders = {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    };

    const normalize = (value = "") => String(value).trim().toLowerCase();
    const title = book.title || "";
    const authors = book.authors || "";
    const publisher = book.publisher || "";

    const duplicateCheckResponse = await fetch(
      `https://api.notion.com/v1/databases/${process.env.DATABASE_ID}/query`,
      {
        method: "POST",
        headers: notionHeaders,
        body: JSON.stringify({
          filter: {
            property: "Name",
            title: {
              equals: title
            }
          },
          page_size: 20
        })
      }
    );

    const duplicateCheckData = await duplicateCheckResponse.json();

    if (!duplicateCheckResponse.ok) {
      console.error("Notion query error:", duplicateCheckData);
      return res.status(duplicateCheckResponse.status).json(duplicateCheckData);
    }

    const isDuplicate = (duplicateCheckData.results || []).some((page) => {
      const props = page.properties || {};
      const existingTitle = (props.Name?.title || []).map((item) => item.plain_text || "").join("");
      const existingAuthors = (props.Authors?.rich_text || []).map((item) => item.plain_text || "").join("");
      const existingPublisher = (props.Publisher?.rich_text || []).map((item) => item.plain_text || "").join("");

      return (
        normalize(existingTitle) === normalize(title) &&
        normalize(existingAuthors) === normalize(authors) &&
        normalize(existingPublisher) === normalize(publisher)
      );
    });

    if (isDuplicate) {
      return res.status(409).json({
        error: "Already added"
      });
    }

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: notionHeaders,
      body: JSON.stringify({
        parent: {
          database_id: process.env.DATABASE_ID
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: book.title || "?쒕ぉ ?놁쓬"
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
          Published: book.publishedDate
            ? {
                date: {
                  start: book.publishedDate
                }
              }
            : {
                date: null
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

    const data = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Notion API error:", data);
      return res.status(notionResponse.status).json(data);
    }

    return res.status(200).json({
      ok: true,
      pageId: data.id
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
