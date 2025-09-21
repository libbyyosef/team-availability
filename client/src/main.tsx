import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react"; // ← no defaultSystem
import { Provider as JotaiProvider } from "jotai";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </ChakraProvider>
  </React.StrictMode>
);
