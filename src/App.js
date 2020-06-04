import React, {useEffect, useState, useMemo} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import styled from "@material-ui/styles/styled";
import {AlertStripeFeil, AlertStripeSuksess} from 'nav-frontend-alertstriper';
import { Xknapp } from 'nav-frontend-ikonknapper';

const AlertContainer = styled(({...props}) => <div aria-live="polite" {...props} />)({
  position: 'fixed',
  zIndex: 100,
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)'
});

const ErrorAlertContent = styled('div')({
  display: "flex",
  '& .knapp': {
    color: 'darkslategrey',
    '& svg': {
      fill: 'darkslategrey'
    }
  }
});

const ErrorAlert = ({exception, onClose}) => <AlertStripeFeil>
  <ErrorAlertContent>
    <div>{exception.message}</div>
    <div><Xknapp type="flat" onClick={onClose} /></div>
  </ErrorAlertContent>
</AlertStripeFeil>;


function AppWrapper({error, flashMessage, clearError, children}) {
  const maybeErrorView = error ? <ErrorAlert exception={error.reason} onClose={clearError} /> : null;
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
  const flashSuccessMessage = (message) => {
    setFlashMessage(message);
    setTimeout(() => setFlashMessage(null), 5000);
  };
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <AuthenticatedApp formio={formio} store={store} flashSuccessMessage={flashSuccessMessage} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <AppWrapper error={error} clearError={() => setError(null)} flashMessage={flashMessage}>{content}</AppWrapper>;
}
export default App;
