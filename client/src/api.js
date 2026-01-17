const POSTS_API = 'http://localhost:5000';
const COMMENTS_API = 'http://localhost:5001';

async function handle(response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

export async function fetchPosts() {
  return handle(await fetch(`${POSTS_API}/posts`));
}

export async function createPost(data) {
  return handle(await fetch(`${POSTS_API}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}

export async function fetchPost(id) {
  return handle(await fetch(`${POSTS_API}/posts/${id}`));
}

export async function deletePost(id) {
  return handle(await fetch(`${POSTS_API}/posts/${id}`, {
    method: 'DELETE',
  }));
}

export async function createComment(postId, data) {
  return handle(await fetch(`${COMMENTS_API}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}