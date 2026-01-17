const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let posts = [];
let idCounter = 1;

app.get("/health", (req, res) => {
  res.json({ status: "posts service ok" });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  // kui tahad ka kohe kommentaarid kaasa (App.jsx ootab comments):
  let comments = [];
  try {
    const r = await fetch(`http://localhost:5001/comments?postId=${id}`);
    if (r.ok) comments = await r.json();
  } catch {}

  res.json({ ...post, comments });
});

app.post("/posts", (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: "title and body are required" });
  }

  const post = {
    id: idCounter++,
    title,
    body,
    createdAt: new Date().toISOString(),
    commentsCount: 0,
  };

  posts.unshift(post);
  res.status(201).json(post);
});

app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  posts = posts.filter(p => p.id !== id);
  res.status(204).end();
});

app.listen(5000, () => {
  console.log("Posts service running on port 5000");
});
