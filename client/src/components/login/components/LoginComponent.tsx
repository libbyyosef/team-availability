import React, { useEffect, useState } from "react";
import { styles, theme } from "../../../assets/styles/styles";

const Clock: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = "#fff" }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        textAlign: "center",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 1,
        color,
        textShadow: "0 2px 10px rgba(0,0,0,0.45)",
      }}
    >
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </div>
  );
};

export const LoginComponent: React.FC<{
  username: string;
  password: string;
  onChangeUser: (v: string) => void;
  onChangePass: (v: string) => void;
  onLogin: () => void;
  loading?: boolean;
}> = ({ username, password, onChangeUser, onChangePass, onLogin, loading = false }) => {
  const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !loading;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div
      style={{
        alignSelf: "stretch",
        justifySelf: "stretch",
        height: "100%",
        width: "100%",
        display: "grid",
        gridTemplateRows: "auto auto 1fr", 
        rowGap: 12,
        background: "transparent",
      }}
    >
      {/* Clock above title */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "clamp(24px, 6vh, 60px)" }}>
        <Clock />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "12px",
        }}
      >
        <h1
          style={{
            ...styles.title,
            margin: 0,
            fontSize: 44,
            lineHeight: 1.15,
            letterSpacing: 0.3,
            textAlign: "center",
            borderBottom: `4px solid ${theme.yellow}`,
            paddingBottom: 8,
          }}
        >
          Welcome to MyWorkStatus
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          placeItems: "center",
          alignItems: "start",
          padding: "70px 0 16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...styles.centerCard,
            maxWidth: 480,
            boxShadow: "0 18px 45px rgba(14,107,216,0.12)",
            border: "1px solid #D8E4F5",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="please enter your email"
                value={username}
                onChange={(e) => onChangeUser(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="please enter your password"
                value={password}
                onChange={(e) => onChangePass(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              disabled={!canSubmit}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
