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
app.post("/comments", (req, res) => {
  const { postId, text } = req.body;

  if (!postId || !text) {
    return res.status(400).json({ error: "postId and text are required" });
  }

  const now = new Date();

  const comment = {
    id: idCounter++,
    postId: Number(postId),
    body: text,                 // frontend ootab "body"
    createdAt: now.toISOString() // frontend parsimiseks kindel ISO string
  };

  comments.push(comment);
  res.status(201).json(comment);
});

app.listen(5001, () => {
  console.log("Comments service running on port 5001");
});
