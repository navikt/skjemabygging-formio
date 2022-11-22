import styled from "@material-ui/styles/styled";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import { AlertStripeAdvarsel, AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { Xknapp } from "nav-frontend-ikonknapper";
import React, { useEffect, useState } from "react";

export const UserAlerterContext = React.createContext();

const AlertContent = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  "& p": {
    margin: 0,
  },
  "& .knapp": {
    color: navCssVariables.navMorkGra,
    backgroundColor: "transparent",
    "& svg": {
      fill: navCssVariables.navMorkGra,
    },
  },
});

const ErrorAlert = ({ exception, onClose }) => (
  <AlertStripeFeil>
    <AlertContent>
      <p>{exception.message || exception}</p>
      <Xknapp onClick={onClose} />
    </AlertContent>
  </AlertStripeFeil>
);

const WarningAlert = ({ message, onClose }) => (
  <AlertStripeAdvarsel>
    <AlertContent>
      <p>{message}</p>
      <Xknapp onClick={onClose} />
    </AlertContent>
  </AlertStripeAdvarsel>
);

const FyllutDeploymentSuccessAlert = ({ data, onClose }) => {
  return (
    <AlertStripeSuksess>
      <AlertContent>
        <div>
          <h3>{data.title}</h3>
          <div>{data.message}</div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeSuksess>
  );
};

const FyllutDeploymentFailureAlert = ({ data, onClose }) => {
  return (
    <AlertStripeFeil>
      <AlertContent>
        <div>
          <h3>{data.title}</h3>
          <div>{data.message}</div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
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

  setWarningMessage(message) {
    let key;
    key = this.addAlertComponent(() => (
      <WarningAlert message={message} onClose={() => this.removeAlertComponent(key)} />
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
    const fyllutDeploymentChannel = pusher.subscribe("fyllut-deployment");
    fyllutDeploymentChannel.bind("success", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <FyllutDeploymentSuccessAlert data={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    fyllutDeploymentChannel.bind("failure", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <FyllutDeploymentFailureAlert data={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    return () => {
      fyllutDeploymentChannel.unbind("success");
      fyllutDeploymentChannel.unbind("failure");
    };
  }, [pusher, userAlerter]);
  return userAlerter;
}
