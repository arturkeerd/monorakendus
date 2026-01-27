// auth/src/index.js
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "auth service ok" }));
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`auth listening on ${PORT}`);
});
