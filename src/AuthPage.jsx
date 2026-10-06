import { useState } from "react";
import api, { saveTokens } from "./api";

const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const switchTo = (next) => {
    setMode(next);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await api.post("/api/auth/register", form);
      const { data } = await api.post("/api/auth/login", {
        username: form.username,
        password: form.password,
      });
      saveTokens(data);
      onAuth(data.user);
    } catch (err) {
      console.error("Auth error:", err);
      if (!err.response) {
        setError("Can't reach the server. Check that the API is running and VITE_API_URL is correct.");
      } else {
        setError(err.response.data?.error || `Server error (${err.response.status}).`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-split">
        {/* Left: decorative panel + tabs */}
        <aside className="auth-side">
          <div className="auth-shapes" aria-hidden="true" />
          <nav className="auth-tabs">
            <button
              type="button"
              className={!isRegister ? "active" : ""}
              onClick={() => switchTo("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={isRegister ? "active" : ""}
              onClick={() => switchTo("register")}
            >
              Register
            </button>
          </nav>
        </aside>

        {/* Right: form */}
        <form onSubmit={submit} className="auth-form">
          <div className="auth-avatar">
            <UserIcon size={34} />
          </div>
          <h1>{isRegister ? "Register" : "Login"}</h1>

          {error && <div className="alert">{error}</div>}

          <label className="field">
            <UserIcon />
            <input
              placeholder="Username"
              aria-label="Username"
              value={form.username}
              onChange={set("username")}
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <LockIcon />
            <input
              type="password"
              placeholder="Password"
              aria-label="Password"
              value={form.password}
              onChange={set("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 6 : undefined}
              required
            />
          </label>

          <div className="auth-actions">
            <span className="hint">
              {isRegister ? "At least 6 characters." : "Sign in to view products."}
            </span>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Please wait…" : isRegister ? "Register" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
