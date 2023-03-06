import React, { createContext, useContext, useEffect } from "react";
import useMessageQueue, { Message } from "../../hooks/useMessageQueue";

const defaultEmit = (_message: string) => {};

const FeedbackEmitContext = createContext({
  success: defaultEmit,
  error: defaultEmit,
  warning: defaultEmit,
});
const FeedbackMessageContext = createContext<Message[]>([]);

function FeedbackProvider({ children }: { children: React.ReactElement }) {
  const [messages, messageQueue] = useMessageQueue();

  useEffect(() => {
    const callback = (error) => messageQueue.push({ message: error, type: "error" });
    window.addEventListener("unhandledrejection", callback);
    return () => window.removeEventListener("unhandledrejection", callback);
  }, [messageQueue]);

  console.log(messages);

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
}

export const useFeedbackMessages = () => useContext(FeedbackMessageContext);
export const useFeedBackEmit = () => useContext(FeedbackEmitContext);

export default FeedbackProvider;
