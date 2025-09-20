import React, { useCallback, useState } from "react";
// Chakra v3 toast lives in @chakra-ui/toast
import { useToast } from "@chakra-ui/toast";
import { LoginComponent } from "../components/LoginComponent";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const LoginContainer: React.FC<{ onAuthed: (fullName: string) => void }> = ({ onAuthed }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const [loading, setLoading] = useState(false); // local, not passed to child (keeps props as requested)

  const notify = useCallback(
    (title: string, status: "success" | "error" | "info" | "warning", description?: string) =>
      // Your installed toast type supports the classic function API
      toast({
        title,
        description,
        status,
        duration: 2200,
        isClosable: true,
        position: "top-right",
      }),
    [toast]
  );

  // Keep onLogin: () => void by wrapping async flow
  const handleLogin = useCallback(() => {
    (async () => {
      const email = username.trim().toLowerCase();
      const pass = password.trim();

      if (!email || !pass) {
        notify("Missing details", "error", "Enter your email and password.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          credentials: "include", // send/receive cookie
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });

        if (!res.ok) {
          notify("Login failed", "error", "Wrong email or password.");
          return;
        }

        const user = await res.json(); // expects UserPublic { first_name, last_name, ... }
        notify("Logged in", "success");
        onAuthed(`${user.first_name} ${user.last_name}`);
      } catch {
        notify("Network error", "error", "Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [username, password, notify, onAuthed]);

  return (
    <>
      <LoginComponent
        username={username}
        password={password}
        onChangeUser={setUsername}
        onChangePass={setPassword}
        onLogin={handleLogin}
      />
      {/* No visual spinner in the child per your prop contract,
          but 'loading' is still tracked here if you want to wire it later. */}
    </>
  );
};
