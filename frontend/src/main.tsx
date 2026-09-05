import React from "react";
import { createRoot } from "react-dom/client";
import { BaseStyles } from "@primer/react";
import { ThemeProvider } from "@primer/react/next";
import "@primer/primitives/dist/css/base/typography/typography.css";
import "@primer/primitives/dist/css/functional/typography/typography.css";
import "@primer/primitives/dist/css/functional/size/radius.css";
import "@primer/primitives/dist/css/functional/themes/dark.css";
import App from "./App";
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider colorMode="dark" nightScheme="dark">
      <BaseStyles>
        <App />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
);
