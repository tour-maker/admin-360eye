import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@fontsource/montserrat";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./store/store.js";

const store = configureStore({
  reducer: rootReducer,
});

createRoot(document.getElementById("root")).render(
<Provider store={store}>
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
  </Provider>
);
