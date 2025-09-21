import React, { useState } from "react";
import { LoginContainer } from "./components/login/container/LoginContainer";
import { StatusesContainer } from "./components/statuses/container/StatusContainer"
import { ENV } from "./config/env";

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

    fetch(`${ENV.API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});

    const cookieName = ENV.COOKIE_NAME ?? "auth";
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
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
