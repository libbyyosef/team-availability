import React, { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/toast";
import { LoginComponent } from "../components/LoginComponent";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const LOGIN_TIMEOUT_MS = 8000;

export const LoginContainer: React.FC<{
  onAuthed: (fullName: string, userId: number) => void;
}> = ({ onAuthed }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const notify = useCallback(
    (title: string, kind: "success" | "error" | "info" | "warning", description?: string) => {
      try {
        const anyToast = toast as any;
        if (typeof anyToast.create === "function") {
          anyToast.create({
            title,
            description,
            type: kind, // Chakra v3
            duration: 2500,
            closable: true,
            placement: "top-end",
          });
        } else {
          anyToast({
            title,
            description,
            status: kind, // classic
            duration: 2500,
            isClosable: true,
            position: "top-right",
          });
        }
      } catch {}
    },
    [toast]
  );

  const readErrorMessage = async (res: Response): Promise<string> => {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return `Login failed (${res.status}). Please try again.`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") return data.detail;
      if (Array.isArray(data?.detail) && data.detail.length && typeof data.detail[0]?.msg === "string") {
        return data.detail[0].msg;
      }
    } catch {}
    return `Login failed (${res.status}). Please try again.`;
  };

  const handleLogin = useCallback(() => {
    if (loading) return;

    (async () => {
      const email = username.trim().toLowerCase();
      const pass = password.trim();

      if (!email || !pass) {
        notify("Missing details", "error", "Enter your email and password.");
        return;
      }

      setLoading(true);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), LOGIN_TIMEOUT_MS);

      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
          signal: ctrl.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          let msg: string;
          switch (res.status) {
            case 401:
              msg = (await readErrorMessage(res)) || "Wrong email or password.";
              break;
            case 404:
              msg = "User not found.";
              break;
            case 422:
              msg = (await readErrorMessage(res)) || "Invalid input.";
              break;
            default:
              msg = (await readErrorMessage(res)) || "Unexpected error. Please try again.";
          }
          notify("Login failed", "error", msg);
          return;
        }

        const user = await res.json(); // { id, first_name, last_name, ... }

        if (!user.id || !user.first_name || !user.last_name) {
          notify("Login error", "error", "Invalid response from server.");
          return;
        }

        // warm cookie
        try {
          await fetch(`${API_URL}/users/list_users_with_statuses`, {
            credentials: "include",
            cache: "no-store",
          });
          await new Promise((r) => setTimeout(r, 50));
        } catch {}

        notify("Logged in", "success");
        onAuthed(`${user.first_name} ${user.last_name}`, user.id);
      } catch (err: any) {
        clearTimeout(timer);
        if (err?.name === "AbortError") {
          notify("Request timed out", "error", "The server didn't respond. Please try again.");
        } else {
          notify("Network error", "error", "Couldn't reach the server. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [username, password, loading, notify, onAuthed]);

  return (
    <LoginComponent
      username={username}
      password={password}
      onChangeUser={setUsername}
      onChangePass={setPassword}
      onLogin={handleLogin}
    />
  );
};
