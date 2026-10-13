import { useState } from "react";
import { apiRequest } from "../api";

const emptyRegister = { username: "", email: "", password: "" };
const emptyLogin = { email: "", password: "" };

export default function AuthPanel({ user, onUser, onResult }) {
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const send = async (method, path, body) => {
    setBusy(true);
    setNotice(null);

    const result = await apiRequest({ method, path, body });
    onResult(result);

    setNotice({
      tone: result.ok ? "ok" : "error",
      text: result.data?.message ?? `${result.status || "No"} response`,
    });

    setBusy(false);
    return result;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const result = await send("POST", "/users/register", {
      ...registerForm,
      email: registerForm.email.toLowerCase(),
    });
    if (result.ok) {
      setRegisterForm(emptyRegister);
      setLoginForm({ email: registerForm.email.toLowerCase(), password: "" });
      setMode("login");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const result = await send("POST", "/users/login", {
      ...loginForm,
      email: loginForm.email.toLowerCase(),
    });
    if (result.ok) {
      onUser(result.data?.user ?? { email: loginForm.email });
      setLoginForm(emptyLogin);
    }
  };

  const handleLogout = async () => {
    const result = await send("POST", "/users/logout", { email: user.email });
    if (result.ok) onUser(null);
  };

  const form = mode === "register" ? registerForm : loginForm;
  const setForm = mode === "register" ? setRegisterForm : setLoginForm;

  return (
    <section className="card">
      <header className="card-head">
        <div>
          <h2>Account</h2>
          <p className="muted">
            {user ? "Signed in" : "Register or log in to test the user API"}
          </p>
        </div>
        {user ? (
          <button className="btn ghost" onClick={handleLogout} disabled={busy}>
            Log out
          </button>
        ) : (
          <div className="segmented" role="tablist">
            {["login", "register"].map((name) => (
              <button
                key={name}
                role="tab"
                aria-selected={mode === name}
                className={mode === name ? "seg active" : "seg"}
                onClick={() => {
                  setMode(name);
                  setNotice(null);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </header>

      {user ? (
        <dl className="kv">
          <div>
            <dt>Username</dt>
            <dd>{user.username ?? "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email ?? "—"}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd className="mono small">{user.id ?? "—"}</dd>
          </div>
        </dl>
      ) : (
        <form
          className="stack"
          onSubmit={mode === "register" ? handleRegister : handleLogin}
        >
          {mode === "register" && (
            <label>
              Username
              <input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="at least 4 characters"
                autoComplete="username"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={
                mode === "register" ? "at least 8 characters" : "••••••••"
              }
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
            />
          </label>

          <button className="btn primary" disabled={busy}>
            {busy ? "Sending…" : mode === "register" ? "Register" : "Log in"}
          </button>
        </form>
      )}

      {notice && <p className={`notice ${notice.tone}`}>{notice.text}</p>}

      <p className="hint">
        Note: the backend has no sessions or tokens yet, so this "signed in"
        state lives only in the page.
      </p>
    </section>
  );
}
