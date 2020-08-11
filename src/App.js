import React, { useEffect, useState, useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import styled from "@material-ui/styles/styled";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { Xknapp } from "nav-frontend-ikonknapper";
import navCssVariabler from "nav-frontend-core";

const AlertContainer = styled(({ ...props }) => <aside aria-live="polite" {...props} />)({
  position: "fixed",
  zIndex: 100,
  top: "10%",
  left: "50%",
  transform: "translateX(-50%)",
});

const ErrorAlertContent = styled("div")({
  display: "flex",
  "& p": {
    margin: 0,
  },
  "& .knapp": {
    color: navCssVariabler.navMorkGra,
    "& svg": {
      fill: navCssVariabler.navMorkGra,
    },
  },
});

const ErrorAlert = ({ exception, onClose }) => (
  <AlertStripeFeil>
    <ErrorAlertContent>
      <p>{exception.message || exception}</p>
      <Xknapp type="flat" onClick={onClose} />
    </ErrorAlertContent>
  </AlertStripeFeil>
);

const DeploymentAlert = ({ message, onClose }) => {
  const isFailure = message.message.state !== "success";
  const ThisAlertStripe = isFailure ? AlertStripeFeil : AlertStripeSuksess;
  return (
    <ThisAlertStripe>
      <ErrorAlertContent>
        <h3>{isFailure ? "Krise og Angst" : "Sol og regn og latter og sang!"}</h3>
        <p></p>
        <Xknapp type="flat" onClick={onClose} />
      </ErrorAlertContent>
    </ThisAlertStripe>
  );
};

const BuildAbortedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeFeil>
      <ErrorAlertContent>
        <div>
          <h3>Bygge feil</h3>
          <p>
            <a href={message.commit.url}>git url</a>
          </p>
          <p>Commit melding: {message.commit.message}</p>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </ErrorAlertContent>
    </AlertStripeFeil>
  );
};

function AppWrapper({
  error,
  clearError,
  flashMessage,
  deploymentMessage,
  clearDeploymentMessage,
  buildAbortedMessage,
  clearBuildAbortedMessage,
  children,
}) {
  const maybeErrorView = error ? <ErrorAlert exception={error.reason} onClose={clearError} /> : null;
  const maybeFlashMessageView = flashMessage ? <AlertStripeSuksess>{flashMessage}</AlertStripeSuksess> : null;
  const maybeDeploymentMessage = deploymentMessage ? (
    <DeploymentAlert message={deploymentMessage} onClose={clearDeploymentMessage} />
  ) : null;
  const maybeBuildAbortedMessage = buildAbortedMessage ? (
    <BuildAbortedAlert message={buildAbortedMessage} onClose={clearBuildAbortedMessage} />
  ) : null;
  return (
    <>
      <AlertContainer>
        {maybeErrorView}
        {maybeFlashMessageView}
        {maybeDeploymentMessage}
        {maybeBuildAbortedMessage}
      </AlertContainer>
      <section>{children}</section>
    </>
  );
}

function App({ projectURL, store, deploymentChannel, buildAbortedChannel }) {
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(null);
  const [deploymentMessage, setDeploymentMessage] = useState(null);
  const [buildAbortedMessage, setBuildAbortedMessage] = useState(null);
  useEffect(() => {
    window.addEventListener("unhandledrejection", setError);
    return () => window.removeEventListener("unhandledrejection", setError);
  }, []);
  useEffect(() => {
    deploymentChannel.bind("status", (data) => {
      setDeploymentMessage(data);
    });
    return () => deploymentChannel.unbind("status");
  }, [deploymentChannel]);
  useEffect(() => {
    buildAbortedChannel.bind("event", (data) => {
      setBuildAbortedMessage(data);
    });
    return () => buildAbortedChannel.unbind("event");
  }, [buildAbortedChannel]);
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
  return (
    <AppWrapper
      error={error}
      clearError={() => setError(null)}
      flashMessage={flashMessage}
      deploymentMessage={deploymentMessage}
      clearDeploymentMessage={() => setDeploymentMessage(null)}
      buildAbortedMessage={buildAbortedMessage}
      clearBuildAbortedMessage={() => setBuildAbortedMessage(null)}
    >
      {content}
    </AppWrapper>
  );
}

export default App;
