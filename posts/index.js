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

app.post("/posts", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const post = { id: idCounter++, title };
  posts.push(post);
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