import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((reg) => {
    console.log("Service Worker registered:", reg);
  });
}


createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
