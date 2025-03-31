import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import Pusher from 'pusher-js';
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import messageQueueReducer, { Message } from './messageQueueReducer';

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
  const [messages, dispatch] = useReducer(messageQueueReducer, []);
  const { config } = useAppConfig();
  const pusher = useMemo(() => createPusher(config), [config]);

  useEffect(() => {
    const fyllutDeploymentChannel = pusher.subscribe(CHANNEL);
    fyllutDeploymentChannel.bind(EVENT.success, ({ title, message }) =>
      dispatch({ type: 'ADD_MESSAGE', payload: { title, message, type: 'success' } }),
    );
    fyllutDeploymentChannel.bind(EVENT.failure, ({ title, message }) =>
      dispatch({ type: 'ADD_MESSAGE', payload: { title, message, type: 'error' } }),
    );
    return () => {
      fyllutDeploymentChannel.unbind(EVENT.success);
      fyllutDeploymentChannel.unbind(EVENT.failure);
      pusher.unsubscribe(CHANNEL);
      pusher.disconnect();
    };
  }, [pusher]);

  const clearAll = () => dispatch({ type: 'CLEAR_ALL' });

  const value = {
    messages,
    clearAll,
  };

  return <PusherNotificationContext.Provider value={value}>{children}</PusherNotificationContext.Provider>;
};

export const usePusherNotifications = () => useContext(PusherNotificationContext);
export default PusherNotificationsProvider;
