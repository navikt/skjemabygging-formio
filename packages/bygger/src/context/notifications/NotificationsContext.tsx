import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import Pusher from "pusher-js";
import React, { createContext, useContext, useEffect } from "react";
import useMessageQueue, { Message } from "../../hooks/useMessageQueue";

export const CHANNEL = "fyllut-deployment";
export const EVENT = { success: "success", failure: "failure" };

const PusherNotificationContext = createContext<Message[]>([]);

function createPusher(config) {
  if (config && config.pusherKey) {
    return new Pusher(config.pusherKey as string, {
      cluster: config.pusherCluster as string,
    });
  }
  return { subscribe: () => ({ bind: () => {}, unbind: () => {} }) };
}

function PusherNotificationsProvider({ children }: { children: React.ReactElement }) {
  const [messages, messageQueue] = useMessageQueue();
  const { config } = useAppConfig();
  const pusher = createPusher(config);

  useEffect(() => {
    const fyllutDeploymentChannel = pusher.subscribe(CHANNEL);
    fyllutDeploymentChannel.bind(EVENT.success, ({ title, message }) =>
      messageQueue.push({ title, message, type: "success" })
    );
    fyllutDeploymentChannel.bind(EVENT.failure, ({ title, message }) =>
      messageQueue.push({ title, message, type: "error" })
    );
    return () => {
      fyllutDeploymentChannel.unbind(EVENT.success);
      fyllutDeploymentChannel.unbind(EVENT.failure);
    };
  }, [pusher, messageQueue]);

  return <PusherNotificationContext.Provider value={messages}>{children}</PusherNotificationContext.Provider>;
}

export const usePusherNotifications = () => useContext(PusherNotificationContext);
export default PusherNotificationsProvider;
