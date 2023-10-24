import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import Pusher from 'pusher-js';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useMessageQueue, { Message } from '../../hooks/useMessageQueue';

export const CHANNEL = 'fyllut-deployment';
export const EVENT = { success: 'success', failure: 'failure' };

interface ContextValue {
  messages: Message[];
  clearAll: () => void;
}
const PusherNotificationContext = createContext<ContextValue>({ messages: [], clearAll: () => {} });

const createPusher = (config) => {
  if (config && config.pusherKey) {
    return new Pusher(config.pusherKey as string, {
      cluster: config.pusherCluster as string,
    });
  }
  return { subscribe: () => ({ bind: () => {}, unbind: () => {} }), unsubscribe: () => {}, disconnect: () => {} };
};

const PusherNotificationsProvider = ({ children }: { children: React.ReactElement }) => {
  const [messages, messageQueue] = useMessageQueue();
  const { config } = useAppConfig();
  const pusher = useMemo(() => createPusher(config), [config]);

  useEffect(() => {
    const fyllutDeploymentChannel = pusher.subscribe(CHANNEL);
    fyllutDeploymentChannel.bind(EVENT.success, ({ title, message }) =>
      messageQueue.push({ title, message, type: 'success' }),
    );
    fyllutDeploymentChannel.bind(EVENT.failure, ({ title, message }) =>
      messageQueue.push({ title, message, type: 'error' }),
    );
    return () => {
      fyllutDeploymentChannel.unbind(EVENT.success);
      fyllutDeploymentChannel.unbind(EVENT.failure);
      pusher.unsubscribe(CHANNEL);
      pusher.disconnect();
    };
  }, [pusher, messageQueue]);

  const value = {
    messages,
    clearAll: () => messageQueue.clearAll(),
  };

  return <PusherNotificationContext.Provider value={value}>{children}</PusherNotificationContext.Provider>;
};

export const usePusherNotifications = () => useContext(PusherNotificationContext);
export default PusherNotificationsProvider;
