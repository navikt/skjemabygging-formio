import React, {useEffect, useState, useMemo} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import {useAuth} from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import styled from "@material-ui/styles/styled";
import {AlertStripeFeil, AlertStripeSuksess} from 'nav-frontend-alertstriper';
import {Xknapp} from 'nav-frontend-ikonknapper';
// import navCssVariabler from 'nav-frontend-core';


const navMorkGra = "#3E3832";

const AlertContainer = styled(({...props}) => <aside aria-live="polite" {...props} />)({
  position: 'fixed',
  zIndex: 100,
  top: '10%',
  left: '50%',
  transform: 'translateX(-50%)'
});

const ErrorAlertContent = styled('div')({
  display: "flex",
  '& p': {
    margin: 0
  },
  '& .knapp': {
    color: navMorkGra,
    '& svg': {
      fill: navMorkGra
    }
  }
});

const ErrorAlert = ({exception, onClose}) => <AlertStripeFeil>
  <ErrorAlertContent>
    <p>{exception.message || exception}</p>
    <Xknapp type="flat" onClick={onClose}/>
  </ErrorAlertContent>
</AlertStripeFeil>;

const DeploymentAlert = ({message, onClose}) => {
  console.log('Deployment alert', message);
  const isFailure = message.message.state !== 'success';
  const ThisAlertStripe = isFailure ? AlertStripeFeil : AlertStripeSuksess;
  return <ThisAlertStripe>
    <ErrorAlertContent>
      <h3>{isFailure ? "Krise og Angst" : "Sol og regn og latter og sang!"}</h3>
      <p>

      </p>
      <Xknapp type="flat" onClick={onClose}/>
    </ErrorAlertContent>
  </ThisAlertStripe>
}


function AppWrapper({error, clearError, flashMessage, deploymentMessage, clearDeploymentMessage, children}) {
  const maybeErrorView = error ? <ErrorAlert exception={error.reason} onClose={clearError}/> : null;
  const maybeFlashMessageView = flashMessage ? <AlertStripeSuksess>{flashMessage}</AlertStripeSuksess> : null;
  const maybeDeploymentMessage = deploymentMessage ?
    <DeploymentAlert message={deploymentMessage} onClose={clearDeploymentMessage}/> : null;
  return <>
    <AlertContainer>
      {maybeErrorView}
      {maybeFlashMessageView}
      {maybeDeploymentMessage}
    </AlertContainer>
    <section>{children}</section>
  </>
}

function App({projectURL, store, deploymentChannel}) {
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(null);
  const [deploymentMessage, setDeploymentMessage] = useState(null);
  useEffect(() => {
    window.addEventListener('unhandledrejection', setError);
    return () => window.removeEventListener("unhandledrejection", setError);
  }, []);
  useEffect(() => {
    deploymentChannel.bind('status', (data) => {
      setDeploymentMessage(data);
    });
    return () => deploymentChannel.unbind('status');
  }, [deploymentChannel]);
  const {userData} = useAuth();
  const flashSuccessMessage = (message) => {
    setFlashMessage(message);
    setTimeout(() => setFlashMessage(null), 5000);
  };
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <AuthenticatedApp formio={formio} store={store} flashSuccessMessage={flashSuccessMessage}/>
  ) : (
    <UnauthenticatedApp projectURL={projectURL}/>
  );
  return <AppWrapper
    error={error}
    clearError={() => setError(null)}
    flashMessage={flashMessage}
    deploymentMessage={deploymentMessage}
    clearDeploymentMessage={() => setDeploymentMessage(null)}>{content}</AppWrapper>;
}

export default App;
