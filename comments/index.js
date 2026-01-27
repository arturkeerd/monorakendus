// comments/index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const requireAuth = require("./src/middlewares/requireAuth");

const allowedOrigins = [
  "https://blog.local",
  "https://blog.local",
  "https://localhost:3000",
];

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

let comments = [];
let idCounter = 1;

async function createComment(req, res) {
  const postId = Number(req.params.id ?? req.body.postId);
  const { body } = req.body;

  if (!postId || !body) {
    return res.status(400).json({ message: "postId and body are required" });
  }

  const comment = {
    id: idCounter++,
    postId,
    body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);

  // publish CommentCreated
  try {
    await axios.post(
      "http://event-bus-srv:5005/events",
      { type: "CommentCreated", data: comment },
      { timeout: 2000 }
    );
  } catch (e) {
    console.log("Failed to publish CommentCreated:", e.message);
  }

  return res.status(201).json(comment);
}

// Ülesande endpoint (kaitstud)
app.post("/posts/:id/comments", requireAuth, createComment);

// Sinu endpoint (kaitstud)
app.post("/comments", requireAuth, createComment);

app.get("/health", (req, res) => {
  res.json({ status: "comments service ok" });
});

app.get("/comments", (req, res) => {
  const { postId } = req.query;
  if (!postId) {
    return res.status(400).json({ error: "postId query param is required" });
  }
  res.json(comments.filter(c => c.postId === Number(postId)));
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Event received in comments:", type);

  if (type === "CommentModerated") {
    const comment = comments.find(c => c.id === data.id);
    if (!comment) return res.send({});

    comment.status = data.status;

    try {
      await axios.post("http://event-bus-srv:5005/events", 
        { type: "CommentUpdated", data: comment },
        { timeout: 2000 }
    );
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