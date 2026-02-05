export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { title } = req.body;

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      parent: {
        database_id: process.env.DATABASE_ID
      },
      properties: {
        이름: {
          title: [{ text: { content: title || "테스트 항목" } }]
        }
      }
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
