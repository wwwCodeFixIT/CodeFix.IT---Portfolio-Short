import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Dodaj klasę js-loaded do body - to ukryje fallback i pokaże React
document.body.classList.add('js-loaded');

// Pokaż root
const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
