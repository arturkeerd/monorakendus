const express = require("express");
const cors = require("cors");

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
    post.comments.push(data);
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

app.listen(5002, () => {
  console.log("Query service running on port 5002");
});
