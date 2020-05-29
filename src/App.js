import React, {useEffect, useState} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";

function AppWrapper({error, children}) {
  const maybeErrorView = error ? <div>{error.reason.message}</div> : null;
  return <>
    {maybeErrorView}
    {children}
    </>
}

function App({ projectURL, store }) {
  const [error, setError] = useState(null);
  useEffect(() => {
    window.addEventListener('unhandledrejection', setError);
    return () => window.removeEventListener("unhandledrejection", setError);
  }, []);
  const { userData } = useAuth();
  const content = userData ? (
    <AuthenticatedApp projectURL={projectURL} store={store} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <AppWrapper error={error}>{content}</AppWrapper>;
}
export default App;
