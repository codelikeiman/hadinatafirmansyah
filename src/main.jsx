import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";
import "./styles/theme.css";
import "./styles/shell.css";
import "./styles/mobile.css";
import RouterProvider from "./app/RouterProvider";
import Shell from "./app/Shell";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider>
      <Shell />
    </RouterProvider>
  </StrictMode>,
);
