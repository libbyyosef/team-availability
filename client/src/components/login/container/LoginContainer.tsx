import React, { useCallback, useState } from "react";
import { LoginComponent } from "../components/LoginComponent";
import { styles } from "../../../assets/styles/styles";
import { useToast } from "@chakra-ui/react"; 
import { ENV } from "../../../config/env"



export const LoginContainer: React.FC<{
  onAuthed: (fullName: string, userId: number) => void;
}> = ({ onAuthed }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast(); 

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
      const email = username.trim();
      const pass = password.trim();

      if (!email || !pass) {
        toast({ status: "error", title: "Missing details", description: "Enter your email and password.", isClosable: true });
        return;
      }

      setLoading(true);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ENV.LOGIN_TIMEOUT_MS);

      try {
        const res = await fetch(`${ENV.API_URL}/auth/login`, {
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
            case 401: msg = (await readErrorMessage(res)) || "Wrong email or password."; break;
            case 404: msg = "User not found."; break;
            case 422: msg = (await readErrorMessage(res)) || "Invalid input."; break;
            default : msg = (await readErrorMessage(res)) || "Unexpected error. Please try again.";
          }
          toast({ status: "error", title: "Login failed", description: msg, isClosable: true });
          return;
        }

        const user = await res.json();
        if (!user?.id || !user?.first_name || !user?.last_name) {
          toast({ status: "error", title: "Invalid response", description: "Invalid response from server.", isClosable: true });
          return;
        }

        const fullName = `${user.first_name} ${user.last_name}`;
        onAuthed(fullName, user.id);
      } catch (err: any) {
        clearTimeout(timer);
        if (err?.name === "AbortError") {
          toast({ status: "error", title: "Timeout", description: "Request timed out. Please try again.", isClosable: true });
        } else {
          toast({ status: "error", title: "Network error", description: "Please check your connection and try again.", isClosable: true });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [username, password, loading, onAuthed]); 

  return (
    <div style={styles.appShell}>
      <LoginComponent
        username={username}
        password={password}
        onChangeUser={setUsername}
        onChangePass={setPassword}
        onLogin={handleLogin}
        loading={loading}
      />
    </div>
  );
};
