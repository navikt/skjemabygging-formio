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

const SkjemautfyllingDeployedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeSuksess>
      <AlertContent>
        <div>
          <h3>Manuell deploy av skjemautfylling</h3>
          <div>
            <p>Versjonen ble endret av "{message.skjemautfyllerCommit.author.name}"</p>
            <p>Endringsmeldingen var "{message.skjemautfyllerCommit.message}"</p>
          </div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeSuksess>
  );
};

const PublishSuccessAlert = ({ message, onClose }) => {
  return (
    <AlertStripeSuksess>
      <AlertContent>
        <h3>Publisering fullført</h3>
        <div>{message.skjemapublisering.skjematittel || message.skjemapublisering.commitUrl} er nå publisert</div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeSuksess>
  );
};

const PublishAbortedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeFeil>
      <AlertContent>
        <h3>Publisering feilet</h3>
        <div>{message.skjemapublisering.skjematittel || message.skjemapublisering.commitUrl} ble ikke publisert</div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeFeil>
  );
};

export const BulkPublishSuccessAlert = ({ message, onClose }) => {
  return (
    <AlertStripeSuksess>
      <AlertContent>
        <h3>Bulk-publisering fullført</h3>
        <div>
          {message.skjemapublisering.antall || "Ukjent antall"} skjemaer ble bulk-publisert. Se&nbsp;
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/navikt/skjemautfylling-formio/commits/master"
          >
            GitHub
          </a>
          &nbsp; for mer informasjon
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeSuksess>
  );
};

export const BulkPublishAbortedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeFeil>
      <AlertContent>
        <h3>Bulk-publisering feilet</h3>
        <div>
          Publisering av {message.skjemapublisering.antall || "ukjent antall"} skjemaer ble avbrutt på grunn av en feil
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeFeil>
  );
};

const BuildAbortedAlert = ({ message, onClose }) => {
  return (
    <AlertStripeFeil>
      <AlertContent>
        <div>
          <h3>Byggefeil</h3>
          <p>
            <a href={message.skjemautfyllerCommit.url}>git url</a>
          </p>
          <p>Commit melding: {message.skjemautfyllerCommit.message}</p>
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
    const deploymentChannel = pusher.subscribe("skjemautfyller-deployed");
    deploymentChannel.bind("publication", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <PublishSuccessAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    deploymentChannel.bind("bulk-publication", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <BulkPublishSuccessAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
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
      deploymentChannel.unbind("bulk-publication");
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
    buildAbortedChannel.bind("bulk-publication", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <BulkPublishAbortedAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
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
      buildAbortedChannel.unbind("bulk-publication");
      buildAbortedChannel.unbind("other");
    };
  }, [pusher, userAlerter]);
  useEffect(() => {
    const buildAbortedChannel = pusher.subscribe("publish-aborted");
    buildAbortedChannel.bind("failure", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <PublishAbortedAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    return () => {
      buildAbortedChannel.unbind("failure");
    };
  }, [pusher, userAlerter]);
  useEffect(() => {
    const buildAbortedChannel = pusher.subscribe("publish-resource-aborted");
    buildAbortedChannel.bind("failure", (data) => {
      let key;
      key = userAlerter.addAlertComponent(() => (
        <PublishAbortedAlert message={data} onClose={() => userAlerter.removeAlertComponent(key)} />
      ));
    });
    return () => buildAbortedChannel.unbind("failure");
  }, [pusher, userAlerter]);
  return userAlerter;
}
