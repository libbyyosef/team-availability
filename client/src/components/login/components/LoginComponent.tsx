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
    <div style={styles.centerCard}>
      <h1 style={styles.title}>Welcome to MyWorkStatus</h1>

      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="enter your email"
            value={username}
            onChange={(e) => onChangeUser(e.target.value)}
          />
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="enter your password"
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
  );
};
