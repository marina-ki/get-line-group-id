const express = require("express");
const app = express();
const line = require("@line/bot-sdk");
const { Client } = require("@notionhq/client");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

app.get("/", (req, res) => res.send("Express on Vercel"));

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// Notionクライアントを初期化
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// NotionデータベースのIDを設定
const databaseId = process.env.NOTION_DATABASE_ID;

// LINEクライアントを初期化
const client = new line.Client(config);

const handleEvent = async (event) => {
  // グループIDを取得して、Notionに保存する
  const groupId = event.source.groupId;
  const roomId = event.source.roomId;
  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      SenderID: {
        title: [
          {
            type: "text",
            text: {
              content: "groupId:" + groupId + ", roomId:" + roomId,
            },
          },
        ],
      },
    },
  });
  return;
};

// app.listen(3000, () => console.log("Server ready on port 3000."));
module.exports = app;
