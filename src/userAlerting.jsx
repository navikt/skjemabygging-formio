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

let key = 0;
function generateKey() {
  return key++;
}

export function useUserAlerting(pusher) {
  const [alertComponentList, setAlertComponentList] = useState([]);
  const addAlertComponent = (alertComponent) => {
    const key = generateKey();
    setAlertComponentList([[key, alertComponent], ...alertComponentList]);
    return key;
  }
  const removeAlertComponent = (key) => {
    const newComponentList = alertComponentList.filter(([key, _]) => key !== key);
    setAlertComponentList(newComponentList);
  };
  const userAlerter = {
    flashSuccessMessage: (message) => {
      const key = addAlertComponent(() => <AlertStripeSuksess>{message}</AlertStripeSuksess>);
      setTimeout(() => removeAlertComponent(key), 5000);
    },
    setErrorMessage: (errorString) => {
      let key;
      key = addAlertComponent(() => <ErrorAlert exception={errorString} onClose={() => removeAlertComponent(key)} />);
    },
    popAlert: () => {
      const [_, ...tail] = alertComponentList;
      setAlertComponentList(tail);
    }
  };

  useEffect(() => {
    const callback = (error) => {
      console.log("new unhandled rejection erorr handlingasd", error);
      addAlertComponent(() => <ErrorAlert exception={error.reason} onClose={() => userAlerter.clearAlert()} />);
    };
    window.addEventListener("unhandledrejection", callback);
    return () => window.removeEventListener("unhandledrejection", callback);
  }, []);
  useEffect(() => {
    const deploymentChannel = pusher.subscribe("deployment");
    deploymentChannel.bind("status", (data) => {
      addAlertComponent(() => <DeploymentAlert message={data} onClose={() => userAlerter.clearAlert()} />);
    });
    return () => deploymentChannel.unbind("status");
  }, [pusher]);
  useEffect(() => {
    const buildAbortedChannel = pusher.subscribe("build-aborted");
    buildAbortedChannel.bind("event", (data) => {
      addAlertComponent(() => <BuildAbortedAlert message={data} onClose={() => userAlerter.clearAlert()} />);
    });
    return () => buildAbortedChannel.unbind("event");
  }, [pusher]);
  let [alertComponent, ..._] = alertComponentList;
  alertComponent = alertComponent ? alertComponent : null;
  return {
    alertComponent,
    userAlerter,
  };
}