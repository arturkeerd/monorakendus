// client/src/api.js
async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchPosts() {
  return handle(await fetch('/api/posts'));
}

export async function createPost(data) {
  return handle(await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}

export async function fetchPost(id) {
  return handle(await fetch(`/api/posts/${id}`));
}

export async function createComment(postId, data) {
  return handle(await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}

export async function deletePost(id) {
  return handle(await fetch(`/api/posts/${id}`, { method: 'DELETE' }));
}
