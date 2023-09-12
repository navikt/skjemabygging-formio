import React, { createContext, useContext, useEffect } from "react";
import useMessageQueue, { Message } from "../../hooks/useMessageQueue";

const defaultEmit = (message: string) => {};

export const FeedbackEmitContext = createContext({
  success: defaultEmit,
  error: defaultEmit,
  warning: defaultEmit,
});
const FeedbackMessageContext = createContext<Message[]>([]);

const FeedbackProvider = ({ children }: { children: React.ReactElement }) => {
  const [messages, messageQueue] = useMessageQueue();

  useEffect(() => {
    const callback = (error: PromiseRejectionEvent) => {
      if (error?.reason?.message) {
        messageQueue.push({ message: error.reason.message, type: "error" });
      }
    };
    window.addEventListener("unhandledrejection", callback);
    return () => window.removeEventListener("unhandledrejection", callback);
  }, [messageQueue]);

  const emit = {
    success: (message: string) => messageQueue.push({ message, type: "success" }),
    warning: (message: string) => messageQueue.push({ message, type: "error" }),
    error: (message: string) => messageQueue.push({ message, type: "warning" }),
  };

  return (
    <FeedbackEmitContext.Provider value={emit}>
      <FeedbackMessageContext.Provider value={messages}>{children}</FeedbackMessageContext.Provider>
    </FeedbackEmitContext.Provider>
  );
};

export const useFeedbackMessages = () => useContext(FeedbackMessageContext);
export const useFeedbackEmit = () => useContext(FeedbackEmitContext);

export default FeedbackProvider;
