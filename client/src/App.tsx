import React, { useState } from "react";
import { styles } from "./assets/styles/styles";
import { LoginContainer } from "./components/login/container/LoginContainer";
import { StatusesContainer } from "./components/statuses/container/StatusContainer";

const App: React.FC = () => {
  const [authedUser, setAuthedUser] = useState<string | null>(null);

  return (
    <div style={styles.appShell}>
      {authedUser ? (
        <StatusesContainer
          userName={authedUser}
          onLogout={() => setAuthedUser(null)}   // <-- clears session, back to login
        />
      ) : (
        <LoginContainer onAuthed={setAuthedUser} />
      )}
    </div>
  );
};

export default App;
