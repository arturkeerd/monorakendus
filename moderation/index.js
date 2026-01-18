// moderation/index.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "moderation service ok" });
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Event received in moderation:", type);

  if (type === "CommentCreated") {
    const body = String(data.body ?? "");
    const status = body.includes("orange") ? "rejected" : "approved";

    try {
      await axios.post("http://event-bus-srv:5005/events", {
          type: "CommentModerated",
          data: {
            id: data.id,
            postId: data.postId,
            status,
            body: data.body,
          },
        });

      console.log("Published CommentModerated:", { id: data.id, status });
    } catch (e) {
      console.log("Failed to publish CommentModerated:", e.message);
    }
  }

  res.send({});
});

app.listen(5003, () => {
  console.log("Moderation service running on port 5003");
});
