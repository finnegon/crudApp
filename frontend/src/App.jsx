import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";
import useTheme from "./useTheme";
import AuthPanel from "./components/AuthPanel";
import PostsPanel from "./components/PostsPanel";
import RequestLog from "./components/RequestLog";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [log, setLog] = useState([]);
  const { theme, toggle } = useTheme();

  const addLog = useCallback((result) => {
    setLog((entries) => [{ ...result, id: crypto.randomUUID() }, ...entries].slice(0, 20));
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const result = await apiRequest({ method: "GET", path: "/posts/getPosts" });
    addLog(result);
    if (result.ok && Array.isArray(result.data)) setPosts(result.data);
    setLoadingPosts(false);
  }, [addLog]);

  // Load posts once on mount so the list (and its edit/delete actions) is
  // visible without having to click Fetch first.
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-text">
          <div className="brand">
            <span className="dot" />
            <h1>CRUD Tester</h1>
          </div>
          <p className="muted">
            A small console for the Express + MongoDB API at{" "}
            <span className="mono">localhost:4000</span>
          </p>
        </div>

        <button
          className="btn ghost icon"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="grid">
        <div className="column">
          <AuthPanel user={user} onUser={setUser} onResult={addLog} />
          <RequestLog entries={log} onClear={() => setLog([])} />
        </div>

        <div className="column">
          <PostsPanel
            posts={posts}
            loading={loadingPosts}
            onRefresh={fetchPosts}
            onResult={addLog}
          />
        </div>
      </main>
    </div>
  );
}
