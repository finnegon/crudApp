import { useState } from "react";
import { apiRequest } from "../api";

const emptyPost = { name: "", description: "", age: "" };

const toForm = (post) => ({
  name: post.name ?? "",
  description: post.description ?? "",
  age: post.age === undefined ? "" : String(post.age),
});

export default function PostsPanel({ posts, loading, onRefresh, onResult }) {
  const [form, setForm] = useState(emptyPost);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyPost);
  const [busyId, setBusyId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const flash = (tone, text) => setNotice({ tone, text });

  const handleCreate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);

    const result = await apiRequest({
      method: "POST",
      path: "/posts/create",
      body: {
        name: form.name.trim(),
        description: form.description.trim(),
        age: Number(form.age),
      },
    });

    onResult(result);
    flash(
      result.ok ? "ok" : "error",
      result.data?.message ?? `Status ${result.status}`,
    );

    if (result.ok) {
      setForm(emptyPost);
      onRefresh();
    }

    setBusy(false);
  };

  const handleList = async () => {
    const result = await apiRequest({ method: "GET", path: "/posts/getPosts" });
    onResult(result);
    if (!result.ok) {
      flash("error", result.data?.message ?? `Status ${result.status}`);
    }
  };

  const startEdit = (post) => {
    setConfirmingId(null);
    setNotice(null);
    setEditingId(post._id);
    setEditForm(toForm(post));
  };

  const handleUpdate = async (event, id) => {
    event.preventDefault();
    setBusyId(id);
    setNotice(null);

    const result = await apiRequest({
      method: "PATCH",
      path: `/posts/update/${id}`,
      body: {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        age: Number(editForm.age),
      },
    });

    onResult(result);
    flash(
      result.ok ? "ok" : "error",
      result.data?.message ??
        result.data?.error?.message ??
        `Status ${result.status}`,
    );

    if (result.ok) {
      setEditingId(null);
      onRefresh();
    }

    setBusyId(null);
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    setNotice(null);

    const result = await apiRequest({
      method: "DELETE",
      path: `/posts/delete/${id}`,
    });

    onResult(result);
    flash(
      result.ok ? "ok" : "error",
      result.data?.message ?? `Status ${result.status}`,
    );

    setConfirmingId(null);
    if (result.ok) onRefresh();

    setBusyId(null);
  };

  return (
    <>
      <section className="card">
        <header className="card-head">
          <div>
            <h2>Create a post</h2>
            <p className="muted">POST /api/v1/posts/create</p>
          </div>
        </header>

        <form className="stack" onSubmit={handleCreate}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My first post"
            />
          </label>

          <label>
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="A short description"
            />
          </label>

          <label>
            Age
            <input
              type="number"
              min="1"
              max="200"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="1 – 200"
            />
          </label>

          <button className="btn primary" disabled={busy}>
            {busy ? "Creating…" : "Create post"}
          </button>
        </form>

        {notice && <p className={`notice ${notice.tone}`}>{notice.text}</p>}
      </section>

      <section className="card">
        <header className="card-head">
          <div>
            <h2>Posts</h2>
            <p className="muted">
              GET /api/v1/posts/getPosts · {posts.length} loaded
            </p>
          </div>
          <button className="btn ghost" onClick={handleList} disabled={loading}>
            {loading ? "Loading…" : "Fetch"}
          </button>
        </header>

        {posts.length === 0 ? (
          <p className="empty">No posts yet. Create one to see it here.</p>
        ) : (
          <ul className="posts">
            {posts.map((post) => {
              const id = post._id;
              const isEditing = editingId === id;
              const isBusy = busyId === id;
              const isConfirming = confirmingId === id;

              if (isEditing) {
                return (
                  <li key={id}>
                    <form
                      className="post-edit"
                      onSubmit={(event) => handleUpdate(event, id)}
                    >
                      <label>
                        Name
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </label>

                      <label>
                        Description
                        <textarea
                          rows="2"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Age
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={editForm.age}
                          onChange={(e) =>
                            setEditForm({ ...editForm, age: e.target.value })
                          }
                        />
                      </label>

                      <div className="post-actions">
                        <button className="btn primary tiny" disabled={isBusy}>
                          {isBusy ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          className="btn ghost tiny"
                          onClick={() => setEditingId(null)}
                          disabled={isBusy}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </li>
                );
              }

              return (
                <li key={id}>
                  <div className="post-head">
                    <strong>{post.name}</strong>
                    <span className="pill">{post.age}</span>
                  </div>
                  <p>{post.description}</p>
                  <span className="mono small muted">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : id}
                  </span>

                  {isConfirming ? (
                    <div className="post-actions confirm">
                      <span className="small">Delete this post?</span>
                      <button
                        className="btn danger tiny"
                        onClick={() => handleDelete(id)}
                        disabled={isBusy}
                      >
                        {isBusy ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        className="btn ghost tiny"
                        onClick={() => setConfirmingId(null)}
                        disabled={isBusy}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="post-actions">
                      <button
                        className="btn ghost tiny"
                        onClick={() => startEdit(post)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn ghost tiny"
                        onClick={() => {
                          setEditingId(null);
                          setConfirmingId(id);
                        }}
                      >
                        Delete
                      </button>
                      <span className="mono tiny muted">PATCH/DELETE ·{id}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
