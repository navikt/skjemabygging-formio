import React, {useEffect, useState, useMemo} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";

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

  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <AuthenticatedApp formio={formio} store={store} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <AppWrapper error={error}>{content}</AppWrapper>;
}
export default App;
