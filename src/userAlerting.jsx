import React, { useEffect, useState } from "react";
import styled from "@material-ui/styles/styled";
import { AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { Xknapp } from "nav-frontend-ikonknapper";
import navCssVariabler from "nav-frontend-core";

export const UserAlerterContext = React.createContext();

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
const SkjemautfyllingDeployedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeSuksess>
      <ErrorAlertContent>
        <div>
          <h3>Ny versjon av skjemautfylling</h3>
          <div>
            <p>Versjonen ble publisert av "{message.skjemautfyllerCommit.author.name}"</p>
            <p>Endringsmeldingen var "{message.skjemautfyllerCommit.message}"</p>
          </div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </ErrorAlertContent>
    </AlertStripeSuksess>
  );
};

const PublishSuccessAlert = ({ message, onClose }) => {
  return (
    <AlertStripeSuksess>
      <ErrorAlertContent>
        <h3>Publisering fullført</h3>
        <div>{message.skjemapublisering.commitUrl} er nå publisert</div>
        <Xknapp type="flat" onClick={onClose} />
      </ErrorAlertContent>
    </AlertStripeSuksess>
  );
};

const PublishAbortedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeFeil>
      <ErrorAlertContent>
        <h3>Publisering feilet</h3>
        <div>{message.skjemapublisering.commitUrl} ble ikke publisert</div>
        <Xknapp type="flat" onClick={onClose} />
      </ErrorAlertContent>
    </AlertStripeFeil>
  );
};

const BuildAbortedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeFeil>
      <ErrorAlertContent>
        <div>
          <h3>Bygge feil</h3>
          <p>
            <a href={message.skjemautfyllerCommit.url}>git url</a>
          </p>
          <p>Commit melding: {message.skjemautfyllerCommit.message}</p>
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

class UserAlerter {
  constructor(alertComponentList, setAlertComponentList) {
    this.alertComponentList = alertComponentList;
    this.setAlertComponentList = setAlertComponentList;
  }

  flashSuccessMessage(message) {
    const key = this.addAlertComponent(() => <AlertStripeSuksess>{message}</AlertStripeSuksess>);
    setTimeout(() => this.removeAlertComponent(key), 5000);
  }

  setErrorMessage(errorString) {
    let key;
    key = this.addAlertComponent(() => (
      <ErrorAlert exception={errorString} onClose={() => this.removeAlertComponent(key)} />
    ));
  }

  popAlert() {
    const [, ...tail] = this.alertComponentList;
    this.setAlertComponentList(tail);
  }

  addAlertComponent(alertComponent) {
    const key = generateKey();
    this.setAlertComponentList([[key, alertComponent], ...this.alertComponentList]);
    return key;
  }

  removeAlertComponent(key) {
    const newComponentList = this.alertComponentList.filter(([eachKey, _]) => eachKey !== key);
    this.setAlertComponentList(newComponentList);
  }

  alertComponent() {
    const [alertComponent] = this.alertComponentList;
    return alertComponent ? alertComponent[1] : null;
  }
}

function useBasicUserAlerter() {
  const [alertComponentList, setAlertComponentList] = useState([]);
  return new UserAlerter(alertComponentList, setAlertComponentList);
}

export function useUserAlerting(pusher) {
  const userAlerter = useBasicUserAlerter();
  useEffect(() => {
    const callback = (error) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <ErrorAlert exception={error.reason} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    };
    window.addEventListener("unhandledrejection", callback);
    return () => window.removeEventListener("unhandledrejection", callback);
  }, [userAlerter]);
  useEffect(() => {
    const deploymentChannel = pusher.subscribe("skjemautfyller-deployed");
    deploymentChannel.bind("publication", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <PublishSuccessAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    deploymentChannel.bind("other", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <SkjemautfyllingDeployedAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    return () => {
      deploymentChannel.unbind("other");
      deploymentChannel.unbind("publication");
    };
  }, [pusher, userAlerter]);
  useEffect(() => {
    const buildAbortedChannel = pusher.subscribe("build-aborted");
    buildAbortedChannel.bind("publication", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <PublishAbortedAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    buildAbortedChannel.bind("other", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <BuildAbortedAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    return () => {
      buildAbortedChannel.unbind("publication");
      buildAbortedChannel.unbind("other");
    };
  }, [pusher, userAlerter]);
  return userAlerter;
}
