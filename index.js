import express from "express"
import router from "./src/routes/postRouter.js";

const app = express();
const port = 3030;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use("/api/posts", router);

export const posts = [
  {id:1, title: "Postitus1", body: "Siin on lühikirjeldus postitus 1-le", createdAt: Date.now()},
  {id:2, title: "Postitus2", body: "Siin on lühikirjeldus postitus 2-le", createdAt: Date.now()},
  {id:3, title: "Postitus3", body: "Siin on lühikirjeldus postitus 3-le", createdAt: Date.now()}
]

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

