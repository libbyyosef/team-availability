import React, { useEffect, useState } from "react";
import { LoginComponent } from "../components/LoginComponent";
import { authenticate } from "../../../assets/types/types";

// Inline toast hook
type ToastType = "success" | "error" | "info";
function useToast(autoHideMs = 2200) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), autoHideMs);
    return () => clearTimeout(t);
  }, [toast, autoHideMs]);
  const show = (msg: string, type: ToastType) => setToast({ msg, type });
  const element = toast ? (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: toast.type === "success" ? "#16a34a" : toast.type === "error" ? "#ef4444" : "#2563eb",
        color: "white",
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        fontWeight: 600,
        maxWidth: 360,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>{toast.msg}</span>
      <button
        onClick={() => setToast(null)}
        style={{
          marginLeft: 8,
          background: "rgba(255,255,255,0.2)",
          border: 0,
          color: "white",
          padding: "4px 8px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        ×
      </button>
    </div>
  ) : null;
  return { show, element };
}

export const LoginContainer: React.FC<{ onAuthed: (displayName: string) => void }> = ({ onAuthed }) => {
  const [username, setUsername] = useState(""); // email
  const [password, setPassword] = useState("");
  const { show, element: toast } = useToast();

  const handleLogin = () => {
    const user = authenticate(username, password);
    if (!user) {
      show("Wrong email or password", "error");
      return;
    }
    // exact text as requested:
    show("you logged in succesfully", "success");
    onAuthed(`${user.firstName} ${user.lastName}`.trim());
  };

  return (
    <>
      <LoginComponent
        username={username}
        password={password}
        onChangeUser={setUsername}
        onChangePass={setPassword}
        onLogin={handleLogin}
      />
      {toast}
    </>
  );
};
