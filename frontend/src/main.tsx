import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { TreeDataProvider } from "@/contexts/TreeDataContext.tsx";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TreeDataProvider>
      <App />
    </TreeDataProvider>
  </React.StrictMode>
);