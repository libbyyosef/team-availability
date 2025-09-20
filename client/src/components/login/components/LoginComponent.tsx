import React from "react";
import { styles } from "../../../assets/styles/styles";

export const LoginComponent: React.FC<{
  username: string; // email
  password: string;
  onChangeUser: (v: string) => void;
  onChangePass: (v: string) => void;
  onLogin: () => void;
}> = ({ username, password, onChangeUser, onChangePass, onLogin }) => {
  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    // Fills the appShell area and creates two rows:
    // row 1 = title (auto height), row 2 = card area (fills rest, centered)
    <div
      style={{
        alignSelf: "stretch",
        justifySelf: "stretch",
        height: "100%",
        width: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        rowGap: 12,
      }}
    >
      {/* Row 1: Title at the top */}
     <div
  style={{
    display: "flex",
    justifyContent: "center",
    // push the title down toward the card while keeping the card as-is
    paddingTop: "clamp(48px, 12vh, 120px)",
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
    }}
  >
    Welcome to MyWorkStatus
  </h1>
</div>

      {/* Row 2: Card centered within the remaining space */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          alignItems:"start",
          padding: "80px 0 16px",
          // ensures inner content doesn't cause page scroll
          overflow: "hidden",
        }}
      >
        <div style={{ ...styles.centerCard, maxWidth: 480 }}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="please enter your email"
                value={username}
                onChange={(e) => onChangeUser(e.target.value)}
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
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
