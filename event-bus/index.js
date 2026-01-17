const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const events = [];

// receive + forward events
app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);

  console.log("Event received:", event.type);

  // Forward to services (best-effort)
  try {
    await fetch("http://localhost:5000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.log("Failed to forward to posts:", e.message);
  }

  try {
    await fetch("http://localhost:5001/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.log("Failed to forward to comments:", e.message);
  }

  res.send({ status: "OK" });
});

// allow services to sync on restart
app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(5005, () => {
  console.log("Event Bus running on port 5005");
});
