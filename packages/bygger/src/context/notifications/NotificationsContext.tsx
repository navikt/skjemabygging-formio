import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import Pusher from "pusher-js";
import React, { createContext, useContext, useEffect } from "react";
import useMessageQueue, { Message } from "../../hooks/useMessageQueue";

const PusherNotificationContext = createContext<Message[]>([]);

function createPusher(config) {
  if (config && config.pusherKey) {
    return new Pusher(config.pusherKey as string, {
      cluster: config.pusherCluster as string,
    });
  }
  return { subscribe: () => ({ bind: () => {}, unbind: () => {} }) };
}

export function PusherNotificationsProvider({ children }: { children: React.ReactElement }) {
  const [messages, messageQueue] = useMessageQueue();
  const { config } = useAppConfig();
  const pusher = createPusher(config);

  useEffect(() => {
    const fyllutDeploymentChannel = pusher.subscribe("fyllut-deployment");
    fyllutDeploymentChannel.bind("success", ({ title, message }) =>
      messageQueue.push({ title, message, type: "success" })
    );
    fyllutDeploymentChannel.bind("failure", ({ title, message }) =>
      messageQueue.push({ title, message, type: "error" })
    );
    return () => {
      fyllutDeploymentChannel.unbind("success");
      fyllutDeploymentChannel.unbind("failure");
    };
  }, [pusher, messageQueue]);

  return <PusherNotificationContext.Provider value={messages}>{children}</PusherNotificationContext.Provider>;
}

export const usePusherNotifications = () => useContext(PusherNotificationContext);
