import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import messageQueueReducer, { Message } from './messageQueueReducer';

type FeedbackMessageContextValue = {
  messages: Message[];
  clearMessage: (id: string) => void;
};

const defaultEmit = (_message: string) => {};

export const FeedbackEmitContext = createContext({
  success: defaultEmit,
  error: defaultEmit,
  warning: defaultEmit,
});
const FeedbackMessageContext = createContext<FeedbackMessageContextValue>({ messages: [], clearMessage: () => {} });

const FeedbackProvider = ({ children }: { children: React.ReactElement }) => {
  const [messages, dispatch] = useReducer(messageQueueReducer, []);

  useEffect(() => {
    const callback = (error: PromiseRejectionEvent) => {
      if (error?.reason?.message) {
        dispatch({ type: 'ADD_MESSAGE', payload: { message: error.reason.message, type: 'error' } });
      }
    };
    window.addEventListener('unhandledrejection', callback);
    return () => window.removeEventListener('unhandledrejection', callback);
  }, []);

  const emit = useMemo(
    () => ({
      success: (message: string) => dispatch({ type: 'ADD_MESSAGE', payload: { message, type: 'success' } }),
      warning: (message: string) => dispatch({ type: 'ADD_MESSAGE', payload: { message, type: 'warning' } }),
      error: (message: string) => dispatch({ type: 'ADD_MESSAGE', payload: { message, type: 'error' } }),
    }),
    [],
  );

  const clearMessage = (id: string) => dispatch({ type: 'REMOVE_MESSAGE', payload: { id } });

  return (
    <FeedbackMessageContext.Provider value={{ messages, clearMessage }}>
      <FeedbackEmitContext.Provider value={emit}>{children}</FeedbackEmitContext.Provider>
    </FeedbackMessageContext.Provider>
  );
};

export const useFeedbackMessages = () => useContext(FeedbackMessageContext);
export const useFeedbackEmit = () => useContext(FeedbackEmitContext);

export default FeedbackProvider;
