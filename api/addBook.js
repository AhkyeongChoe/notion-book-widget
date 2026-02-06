export default async function handler(req, res) {
  // POST만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const book = req.body;

    // 기본 방어
    if (!book || !book.title) {
      return res.status(400).json({ error: "Invalid book data" });
    }

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
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
          // 노션 DB의 Title 속성 이름과 반드시 동일해야 함
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

        // 페이지 본문에 표지 이미지 추가
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

    // Notion API 에러 그대로 전달
    if (!notionResponse.ok) {
      console.error("Notion API error:", data);
      return res.status(notionResponse.status).json(data);
    }

    // 프론트에서 쓰기 좋은 응답
    return res.status(200).json({
      ok: true,
      pageId: data.id
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
