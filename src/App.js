import React from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
function App({ projectURL, store }) {
  const { userData } = useAuth();
  return userData ? (
    <AuthenticatedApp projectURL={projectURL} store={store} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
}
export default App;
