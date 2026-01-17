const express = require("express");
const cors = require("cors");

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

  if (!postId) {
    return res.status(400).json({ error: "postId query param is required" });
  }

  const result = comments.filter(
    c => c.postId === Number(postId)
  );

  res.json(result);
});

// comments/index.js
app.post("/comments", async (req, res) => {
  const { postId, body } = req.body;
  if (!postId || !body) {
    return res.status(400).json({ message: "postId and body are required" });
  }

  const comment = {
    id: idCounter++,
    postId: Number(postId),
    body,
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);

  // publish event
  try {
    await fetch("http://localhost:5005/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "CommentCreated",
        data: comment,
      }),
    });
  } catch (e) {
    console.log("Failed to publish CommentCreated:", e.message);
  }

  res.status(201).json(comment);
});


app.post("/events", (req, res) => {
  console.log("Event received in comments:", req.body.type);
  res.send({});
});

app.listen(5001, () => {
  console.log("Comments service running on port 5001");
});
