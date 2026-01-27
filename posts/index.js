const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const allowedOrigins = [
  "https://blog.local",
  "http://blog.local",
  "http://localhost:3000",
];

const requireAuth = require("./middlewares/requireAuth");

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());

let posts = [];
let idCounter = 1;

app.get("/health", (req, res) => {
  res.json({ status: "posts service ok" });
});

// ✅ ainult kaitstud GET /posts
app.get("/posts", requireAuth, (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const COMMENTS_URL = process.env.COMMENTS_URL || "http://localhost:5001";

  let comments = [];
  try {
    const { data } = await axios.get(`${COMMENTS_URL}/comments?postId=${id}`);
    comments = data;
  } catch (e) {
    console.log("Failed to fetch comments:", e.message);
  }

  res.json({ ...post, comments });
});

// NB: see route peab olemas olema, sest Ingress suunab siia /posts/create
app.post("/posts/create", async (req, res) => {
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

  try {
    await axios.post("http://event-bus-srv:5005/events", {
      type: "PostCreated",
      data: post,
    });
  } catch (e) {
    console.log("Failed to publish PostCreated:", e.message);
  }

  res.status(201).json(post);
});

app.post("/events", (req, res) => {
  console.log("Event received in posts:", req.body.type);
  res.send({});
});

app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  posts = posts.filter((p) => p.id !== id);
  res.status(204).end();
});

app.listen(5000, () => {
  console.log("Posts service running on port 5000");
});
