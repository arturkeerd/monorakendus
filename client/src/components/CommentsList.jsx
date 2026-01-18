export default function CommentsList({ comments }) {
  const renderText = (c) => {
    if (c.status === "pending") return "Kommentaar on modereerimise ootel";
    if (c.status === "rejected") return "Kommentaar lükati tagasi";
    return c.body; // approved või puuduv status
  };

  if (!comments?.length) return null;

  return (
    <ul className="comments-list">
      {comments.map((c) => (
        <li key={c.id}>
          • {renderText(c)}
          {c.createdAt ? (
            <div className="comment-meta">
              {new Date(c.createdAt).toLocaleString()}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}