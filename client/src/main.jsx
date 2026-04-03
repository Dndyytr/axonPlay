import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { store } from "./store/store.js";
import { getMe } from "./store/authSlice.js";

// Wrap App to check auth status on load
export const AppWrapper = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token is still valid
      store.dispatch(getMe());
    }
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
