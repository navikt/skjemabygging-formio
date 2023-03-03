import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import Pusher from "pusher-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ErrorAlert, FyllutDeploymentFailureAlert, FyllutDeploymentSuccessAlert } from "../../components/Alerts";
import { UserAlerter } from "../../userAlerting";

interface Props {
  children: React.ReactElement;
  pusher: any;
}

const PusherNotificationContext = createContext<() => JSX.Element | null>(() => null);

function createPusher(config) {
  if (config && config.pusherKey) {
    return new Pusher(config.pusherKey as string, {
      cluster: config.pusherCluster as string,
    });
  }
  return { subscribe: () => ({ bind: () => {}, unbind: () => {} }) };
}

function useUserAlerter() {
  const [alerts, setAlerts] = useState([]);
  return new UserAlerter(alerts, setAlerts);
}

export function PusherNotificationsProvider({ children }: Props) {
  const userAlerter = useUserAlerter();
  const { config } = useAppConfig();
  const pusher = createPusher(config);

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

  return (
    <PusherNotificationContext.Provider value={userAlerter.alertComponent()}>
      {children}
    </PusherNotificationContext.Provider>
  );
}

export const usePusherNotificationSubscription = () => useContext(PusherNotificationContext);
