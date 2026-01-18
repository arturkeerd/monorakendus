// query/index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// posts state: { [postId]: { id, title, body, createdAt, comments: [] } }
const posts = {};

function handleEvent(event) {
  const { type, data } = event;

  if (type === "PostCreated") {
    posts[data.id] = { ...data, comments: [] };
  }

  if (type === "CommentCreated") {
    const post = posts[data.postId];
    if (!post) return;
    post.comments.push({ ...data, status: data.status ?? "pending" });
  }

  if (type === "CommentUpdated") {
    const post = posts[data.postId];
    if (!post) return;

    const idx = post.comments.findIndex(c => c.id === data.id);
    if (idx === -1) {
      post.comments.push(data);
      return;
    }

    post.comments[idx] = { ...post.comments[idx], ...data };
  }
}

// Query kuulab event-busilt tulevaid sündmusi
app.post("/events", (req, res) => {
  handleEvent(req.body);
  res.send({});
});

// Client küsib siit kõik postid koos kommentaaridega
app.get("/posts", (req, res) => {
  res.send(posts);
});

// Startup sync (vajab, et event-bus pakub GET /events)
(async () => {
  try {
    const { data: events } = await axios.get("http://event-bus-srv:5005/events");
    for (const event of events) handleEvent(event);
    console.log(`Query synced ${events.length} events`);
  } catch (e) {
    console.log("Query sync failed:", e.message);
  }
})();

app.listen(5002, () => {
  console.log("Query service running on port 5002");
});
