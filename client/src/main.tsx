import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider /*, extendTheme */ } from "@chakra-ui/react";
import { App } from "./App";

// Optional: if you want a custom theme
// const theme = extendTheme({});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <ChakraProvider theme={theme}> */}
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
