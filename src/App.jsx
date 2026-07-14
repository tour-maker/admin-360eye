import "./App.css";
import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { router } from "../Routes";
import { setToken } from "./slices/authSlices";

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

const AppWithIdleTimeout = () => {
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);

  const clearTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setToken(null));
    clearTimer();
    router.navigate("/admin");
  };

  const resetTimer = () => {
    clearTimer();

    if (!localStorage.getItem("token")) {
      return;
    }

    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_LIMIT_MS);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimer();
    };
  }, []);

  return <RouterProvider router={router} />;
};

function App() {
  return <AppWithIdleTimeout />;
}

export default App;
