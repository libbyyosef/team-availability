import React, { useState } from "react";
import { LoginContainer } from "./components/login/container/LoginContainer";
import { StatusesContainer } from "./components/statuses/container/StatusContainer"

export const App: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const handleAuthed = (fullName: string, id: number) => {
    setUserName(fullName);
    setUserId(id);
    setIsAuthed(true);
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setUserName("");
    setUserId(null);

    // Best-effort server logout
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});

    // Clear the session cookie client-side
    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  if (!isAuthed || !userId) {
    return <LoginContainer onAuthed={handleAuthed} />;
  }

  return (
    <StatusesContainer
      userName={userName}
      currentUserId={userId}
      onLogout={handleLogout}
    />
  );
};
