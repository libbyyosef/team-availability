// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Toast } from "@chakra-ui/toast";   // ⬅️ import
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <Toast />                              {/* ⬅️ MUST be mounted once */}
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
