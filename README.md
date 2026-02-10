# Notion Book Search Widget

A Notion widget designed for book lovers, allowing you to search books and add them directly to your Notion database.
Book data is provided by Google Books.


## Environment Variables

This project requires the following environment variables to connect to Notion.

Create a `.env` file in the root directory and refer to `.env.example`.

### Required

| Variable | Description |
|--------|-------------|
| NOTION_TOKEN | Internal integration token from Notion |
| DATABASE_ID | Target Notion database ID |

### Setup Guide

1. Create a Notion integration  
   https://www.notion.so/my-integrations

2. Copy the **Internal Integration Token**

3. Share your Notion database with the integration  
   (Invite → select integration)

4. Copy your database ID from the database URL


