import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import AnimatedCanvas from "../components/AnimatedCanvas";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, normalizeUser } from "../api/authService";

/* ─────────────────────────────────────────────────────────
   Field — defined OUTSIDE AuthPage so it is never recreated
   on re-render (fixes the "one character only" bug)
───────────────────────────────────────────────────────── */
function Field({ field, icon, label, type, value, onChange, focused, onFocus, onBlur, onEnter, autoComplete }) {
  const inputStyle = {
    display: "block",
    width: "100%",
    background: focused === field ? "rgba(168,255,108,0.04)" : "#0a0a0a",
    border: `1px solid ${focused === field ? "rgba(168,255,108,0.45)" : "#1e1e1e"}`,
    borderRadius: "var(--r-md)",
    padding: "0.88rem 1rem 0.88rem 2.9rem",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(168,255,108,0.07)" : "none",
    boxSizing: "border-box",
    fontFamily: "var(--font)",
    cursor: "text",
  };

  return (
    <div style={{ position: "relative", zIndex: 2 }}>
      <label style={{
        fontSize: 12.5, color: "#555", display: "block",
        marginBottom: 6, fontWeight: 500, letterSpacing: 0.3,
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {/* Icon — pointer events none so it never blocks the input */}
        <div style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 1,
          lineHeight: 0,
        }}>
          <Icon name={icon} size={14} color={focused === field ? "#a8ff6c" : "#444"} />
        </div>
        <input
          value={value}
          onChange={onChange}
          placeholder={
            type === "email"    ? "you@example.com" :
            type === "password" ? "••••••••"         :
                                  "Your name"
          }
          type={type || "text"}
          style={inputStyle}
          onFocus={() => onFocus(field)}
          onBlur={onBlur}
          onKeyDown={e => e.key === "Enter" && onEnter()}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Password field — also defined outside (show/hide support)
───────────────────────────────────────────────────────── */
function PasswordField({ value, onChange, focused, onFocus, onBlur, onEnter, isLogin, showPass, setShowPass }) {
  const inputStyle = {
    display: "block",
    width: "100%",
    background: focused === "password" ? "rgba(168,255,108,0.04)" : "#0a0a0a",
    border: `1px solid ${focused === "password" ? "rgba(168,255,108,0.45)" : "#1e1e1e"}`,
    borderRadius: "var(--r-md)",
    padding: "0.88rem 3.2rem 0.88rem 2.9rem",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s",
    boxShadow: focused === "password" ? "0 0 0 3px rgba(168,255,108,0.07)" : "none",
    boxSizing: "border-box",
    fontFamily: "var(--font)",
    cursor: "text",
  };

  return (
    <div style={{ position: "relative", zIndex: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, color: "#555", fontWeight: 500, letterSpacing: 0.3 }}>Password</label>
        {isLogin && (
          <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12.5, color: "#a8ff6c" }}>
            Forgot password?
          </a>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none", zIndex: 1, lineHeight: 0,
        }}>
          <Icon name="shield" size={14} color={focused === "password" ? "#a8ff6c" : "#444"} />
        </div>
        <input
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          type={showPass ? "text" : "password"}
          style={inputStyle}
          onFocus={() => onFocus("password")}
          onBlur={onBlur}
          onKeyDown={e => e.key === "Enter" && onEnter()}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setShowPass(s => !s)}
          style={{
            position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", color: "#555",
            fontSize: 11, cursor: "pointer", padding: "2px 5px",
            zIndex: 2, fontFamily: "var(--font)",
          }}
        >
          {showPass ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main AuthPage component
───────────────────────────────────────────────────────── */
export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();

  const [isLogin,  setIsLogin]  = useState(true);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [focused,  setFocused]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleFocus = (field) => setFocused(field);
  const handleBlur  = ()      => setFocused("");

  const switchMode = (login) => {
    setIsLogin(login);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  /* ── Email / Password submit ── */
  const handle = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!isLogin && !name)   { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { user, error: err } = isLogin
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, name);
    setLoading(false);

    if (err) { setError(err); return; }
    onLogin(normalizeUser(user));
    navigate("/dashboard");
  };

  /* ── Google sign-in ── */
  const handleGoogle = async () => {
    setError("");
    setGLoading(true);
    const { user, error: err } = await signInWithGoogle();
    setGLoading(false);
    if (err) { setError(err); return; }
    onLogin(normalizeUser(user));
    navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem", position: "relative", overflow: "hidden",
    }}>
      <AnimatedCanvas />

      <div style={{
        width: "100%", maxWidth: 450,
        position: "relative", zIndex: 10,
        animation: "fadeInUp 0.4s ease",
      }}>

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#444", background: "none", border: "none",
            fontSize: 13, marginBottom: "1.5rem",
            cursor: "pointer", transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#888"}
          onMouseLeave={e => e.currentTarget.style.color = "#444"}
        >
          <Icon name="chevronLeft" size={15} /> Back to home
        </button>

        {/* Card */}
        <div style={{
          background: "rgba(8,8,8,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--r-2xl)",
          padding: "2.5rem",
          boxShadow: "0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(168,255,108,0.05)",
          backdropFilter: "blur(24px)",
          position: "relative",
        }}>

          {/* Top glow line */}
          <div style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(168,255,108,0.5), transparent)",
          }} />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: 58, height: 58,
              background: "linear-gradient(135deg, #a8ff6c, #00e5ff)",
              borderRadius: 17, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 1.2rem",
              boxShadow: "0 0 35px rgba(168,255,108,0.5)",
            }}>
              <Icon name="shield" size={27} color="#000" />
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "1.8rem", letterSpacing: "-0.5px", color: "#fff" }}>
              Smart<span style={{ color: "#a8ff6c" }}>Guard</span>
            </h1>
            <p style={{ color: "#444", fontSize: 14, marginTop: 6 }}>
              {isLogin ? "Welcome back — sign in to continue" : "Create your free account today"}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: "flex", background: "#0a0a0a",
            borderRadius: "var(--r-md)", padding: 4,
            marginBottom: "1.8rem", border: "1px solid #1a1a1a",
          }}>
            {[{ label: "Sign In", login: true }, { label: "Sign Up", login: false }].map(({ label, login }) => (
              <button
                key={label}
                onClick={() => switchMode(login)}
                style={{
                  flex: 1, padding: "0.6rem", borderRadius: 8, border: "none",
                  background: isLogin === login ? "#a8ff6c" : "transparent",
                  color: isLogin === login ? "#000" : "#444",
                  fontWeight: 700, fontSize: 14, transition: "all 0.2s", cursor: "pointer",
                  boxShadow: isLogin === login ? "0 0 16px rgba(168,255,108,0.4)" : "none",
                  fontFamily: "var(--font)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {!isLogin && (
              <Field
                field="name"
                icon="user"
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                focused={focused}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onEnter={handle}
                autoComplete="name"
              />
            )}

            <Field
              field="email"
              icon="zap"
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              focused={focused}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onEnter={handle}
              autoComplete="email"
            />

            <PasswordField
              value={password}
              onChange={e => setPassword(e.target.value)}
              focused={focused}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onEnter={handle}
              isLogin={isLogin}
              showPass={showPass}
              setShowPass={setShowPass}
            />

            {/* Error message */}
            {error && (
              <div style={{
                background: "rgba(255,77,109,0.08)",
                border: "1px solid rgba(255,77,109,0.2)",
                borderRadius: "var(--r-md)",
                padding: "0.7rem 1rem",
                fontSize: 13, color: "#ff4d6d",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Icon name="alert" size={14} color="#ff4d6d" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handle}
              disabled={loading}
              style={{
                background: loading ? "#111" : "#a8ff6c",
                color: loading ? "#444" : "#000",
                border: loading ? "1px solid #1e1e1e" : "none",
                padding: "0.95rem", borderRadius: "var(--r-pill)",
                fontWeight: 800, fontSize: 15, marginTop: "0.4rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s", width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading ? "none" : "0 0 28px rgba(168,255,108,0.45), 0 6px 24px rgba(0,0,0,0.8)",
                fontFamily: "var(--font)",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 0 44px rgba(168,255,108,0.7), 0 8px 32px rgba(0,0,0,0.9)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 0 28px rgba(168,255,108,0.45), 0 6px 24px rgba(0,0,0,0.8)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 15, height: 15, borderRadius: "50%",
                    border: "2px solid #333", borderTopColor: "#a8ff6c",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                isLogin ? "Sign In →" : "Create Account →"
              )}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
            <span style={{ color: "#333", fontSize: 12 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            style={{
              width: "100%", padding: "0.85rem",
              background: "#0a0a0a", border: "1px solid #1e1e1e",
              borderRadius: "var(--r-md)", color: gLoading ? "#444" : "#888",
              fontSize: 14, fontWeight: 500, cursor: gLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.2s", fontFamily: "var(--font)",
            }}
            onMouseEnter={e => { if (!gLoading) { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#fff"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = gLoading ? "#444" : "#888"; }}
          >
            {gLoading ? (
              <div style={{
                width: 17, height: 17, borderRadius: "50%",
                border: "2px solid #333", borderTopColor: "#4285F4",
                animation: "spin 0.8s linear infinite",
              }} />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {gLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <p style={{ textAlign: "center", color: "#333", fontSize: 13, marginTop: "1.5rem" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => switchMode(!isLogin)}
              style={{ color: "#a8ff6c", cursor: "pointer", fontWeight: 600 }}
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
