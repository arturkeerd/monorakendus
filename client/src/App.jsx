import { useEffect, useState } from "react";
import { createPost, deletePost, fetchQueryPosts } from "./api";
import CommentsList from "./components/CommentsList";
import CommentForm from "./components/CommentForm";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function onDelete(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setExpanded(prev => {
      if (!prev[postId]) return prev;
      const copy = { ...prev };
      delete copy[postId];
      return copy;
    });

    try {
      await deletePost(postId);
    } catch (e) {
      alert(e.message || "Delete failed");
      load();
    }
  }

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const data = await fetchQueryPosts(); // objekt: { [id]: post }
      const list = Object.values(data).sort((a, b) => b.id - a.id);

      setPosts(
        list.map(p => ({
          ...p,
          commentsCount: p.comments?.length ?? 0
        }))
      );
    } catch (e) {
      setErr(e.message || "Load error");
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const created = await createPost({ title, body });
    setTitle("");
    setBody("");
    setPosts(prev => [{ ...created, commentsCount: 0 }, ...prev]);
  }

  function toggle(postId) {
    setExpanded(prev => {
      const copy = { ...prev };
      if (copy[postId]) delete copy[postId];
      else copy[postId] = true;
      return copy;
    });
  }

  function onCommentCreated(postId, comment) {
    setExpanded(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: [...(prev[postId]?.comments || []), comment],
      },
    }));

    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p
      )
    );
  }

  return (
    <div className="page">
      <h1>Postid</h1>

      <form onSubmit={onSubmit} className="create-post">
        <label className="field">
          <span>Title</span>
          <input
            placeholder="Pealkiri"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Body</span>
          <textarea
            placeholder="Sisu"
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </label>

        <button type="submit">Submit</button>
      </form>

      <hr />

      <h2>Posts</h2>

      {loading && <p>Laen…</p>}
      {err && <p className="error">{err}</p>}

      {!loading && (
        <div className="posts-grid">
          {posts.map(p => (
            <div key={p.id} className="post-card">
              <h3 className="post-title">{p.title}</h3>

              <div className="post-meta">
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""} • kommentaare:{" "}
                {p.commentsCount ?? 0}
              </div>

              <div className="post-body">{p.body}</div>

              <div className="post-actions">
                <button onClick={() => toggle(p.id)}>
                  {expanded[p.id] ? "Peida kommentaarid" : "Näita kommentaare"}
                </button>
                <button className="danger" onClick={() => onDelete(p.id)}>
                  Kustuta
                </button>
              </div>

              {expanded[p.id] && (
                <div className="comments">
                  <CommentsList comments={p.comments || []} />
                  <CommentForm postId={p.id} onCreated={() => load()} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}