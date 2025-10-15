// index.js
import 'dotenv/config';
import express from 'express';
import router from './src/routes/postRouter.js';

const app = express();
const port = process.env.PORT ?? 4020;
const host = process.env.HOST ?? '0.0.0.0';

app.use(express.json());
app.get('/', (_req, res) => res.send('Hello World!'));
app.use('/api/posts', router);

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});