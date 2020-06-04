import React, {useEffect, useState, useMemo} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import styled from "@material-ui/styles/styled";
import {AlertStripeFeil, AlertStripeSuksess} from 'nav-frontend-alertstriper';

const AlertContainer = styled(({...props}) => <div aria-live="polite" {...props} />)({
  position: 'fixed',
  zIndex: 100,
  bottom: '5%',
  left: '5%'
});


function AppWrapper({error, flashMessage, children}) {
  const maybeErrorView = error ? <AlertStripeFeil>{error.reason.message}</AlertStripeFeil> : null;
  const maybeFlashMessageView = flashMessage ? <AlertStripeSuksess>{flashMessage}</AlertStripeSuksess> : null;
  return <div>
    <AlertContainer>
    {maybeErrorView}
    {maybeFlashMessageView}
    </AlertContainer>
    {children}
    </div>
}

function App({ projectURL, store }) {
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(null);
  useEffect(() => {
    window.addEventListener('unhandledrejection', setError);
    return () => window.removeEventListener("unhandledrejection", setError);
  }, []);
  const { userData } = useAuth();
  const flashTheMessage = (message) => {
    setFlashMessage(message);
    setTimeout(() => setFlashMessage(null), 5000);
  };
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <AuthenticatedApp formio={formio} store={store} flashTheMessage={flashTheMessage} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <AppWrapper error={error} flashMessage={flashMessage}>{content}</AppWrapper>;
}
export default App;
