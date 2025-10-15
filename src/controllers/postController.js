import { posts, nextId } from '../db/posts.js';

// GET /api/posts
export const getPosts = (_req, res) => {
  res.json(posts);
};

// GET /api/posts/:id
export const getPost = (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
};

// POST /api/posts
export const createPost = (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: "title and body required" });

  const newPost = { id: nextId(), title, body, createdAt: Date.now() };
  posts.push(newPost);
  res.status(201).json(newPost);
};

// PUT /api/posts/:id
export const updatePost = (req, res) => {
  const id = Number(req.params.id);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Post not found" });

  const { title, body } = req.body || {};
  posts[idx] = { ...posts[idx], ...(title && { title }), ...(body && { body }) };
  res.json(posts[idx]);
};

// DELETE /api/posts/:id
export const deletePost = (req, res) => {
  const id = Number(req.params.id);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Post not found" });

  const [removed] = posts.splice(idx, 1);
  res.json(removed);
};