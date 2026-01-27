// event-bus/index.js
const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const events = [];

app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);

  console.log("Event received:", event.type);

  // Respond immediately so a slow/unreachable downstream service (e.g., query)
  // can't block the client request.
  res.send({ status: "OK" });

  const targets = [
    { name: "posts", url: "http://posts-srv:5000/events" },
    { name: "comments", url: "http://comments-srv:5001/events" },
    { name: "query", url: "http://query-srv:5002/events" },
    { name: "moderation", url: "http://moderation-srv:5003/events" },
  ];

  await Promise.all(
    targets.map(t =>
      axios.post(t.url, event, { timeout: 2000 }).catch(err => {
        console.log(`Failed to forward to ${t.name}:`, err.message);
      })
    )
  );
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(5005, () => {
  console.log("Event Bus running on port 5005");
});