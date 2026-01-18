// comments/index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

let comments = [];
let idCounter = 1;

app.get("/health", (req, res) => {
  res.json({ status: "comments service ok" });
});

app.get("/comments", (req, res) => {
  const { postId } = req.query;
  if (!postId) return res.status(400).json({ error: "postId query param is required" });
  console.log("CREATED COMMENT:", comment);
  res.status(201).json(comment);
  res.json(comments.filter(c => c.postId === Number(postId)));
});

app.post("/comments", async (req, res) => {
  const { postId, body } = req.body;
  if (!postId || !body) return res.status(400).json({ message: "postId and body are required" });

  const comment = {
    id: idCounter++,
    postId: Number(postId),
    body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);

  // publish CommentCreated
  try {
    await axios.post("http://event-bus-srv:5005/events", {
      type: "CommentCreated",
      data: comment,
    });
  } catch (e) {
    console.log("Failed to publish CommentCreated:", e.message);
  }

  res.status(201).json(comment);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Event received in comments:", type);

  if (type === "CommentModerated") {
    const comment = comments.find(c => c.id === data.id);
    if (!comment) return res.send({});

    comment.status = data.status;

    try {
      await axios.post("http://event-bus-srv:5005/events", {
      type: "CommentUpdated",
      data: comment,
    });
      console.log("Published CommentUpdated:", comment.id);
    } catch (e) {
      console.log("Failed to publish CommentUpdated:", e.message);
    }
  }

  res.send({});
});

app.listen(5001, () => {
  console.log("Comments service running on port 5001");
});