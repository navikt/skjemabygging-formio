import React, { useEffect, useState } from "react";
import styled from "@material-ui/styles/styled";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { Xknapp } from "nav-frontend-ikonknapper";
import navCssVariabler from "nav-frontend-core";

export const AlertContainer = styled(({ ...props }) => <aside aria-live="polite" {...props} />)({
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

export function useUserAlerting(pusher) {
  const [alertComponent, setAlertComponent] = useState(null);
  useEffect(() => {
    const callback = (error) => {
      console.log("new unhandled rejection erorr handlingasd", error);
      setAlertComponent(() => <ErrorAlert exception={error.reason} onClose={() => setAlertComponent(null)} />);
    };
    window.addEventListener("unhandledrejection", callback);
    return () => window.removeEventListener("unhandledrejection", callback);
  }, []);
  useEffect(() => {
    const deploymentChannel = pusher.subscribe("deployment");
    deploymentChannel.bind("status", (data) => {
      setAlertComponent(() => <DeploymentAlert message={data} onClose={() => setAlertComponent(null)} />);
    });
    return () => deploymentChannel.unbind("status");
  }, [pusher]);
  useEffect(() => {
    const buildAbortedChannel = pusher.subscribe("build-aborted");
    buildAbortedChannel.bind("event", (data) => {
      setAlertComponent(() => <BuildAbortedAlert message={data} onClose={() => setAlertComponent(null)} />);
    });
    return () => buildAbortedChannel.unbind("event");
  }, [pusher]);
  const userAlerter = {
    flashSuccessMessage: (message) => {
      setAlertComponent(() => <AlertStripeSuksess>{message}</AlertStripeSuksess>);
      setTimeout(() => setAlertComponent(null), 5000);
    },
    setErrorMessage: (errorString) => {
      setAlertComponent(() => <ErrorAlert exception={errorString} onClose={() => setAlertComponent(null)} />);
    },
  };
  return {
    alertComponent,
    userAlerter,
  };
}