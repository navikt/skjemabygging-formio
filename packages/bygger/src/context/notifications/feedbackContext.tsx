import { createContext, useContext, useState } from "react";
import { UserAlerter } from "../../userAlerting";

const defaultEmit = (message: string) => {};

const FeedbackEmitContext = createContext({
  emitSuccessMessage: defaultEmit,
  emitErrorMessage: defaultEmit,
  emitWarningMessage: defaultEmit,
});
const FeedbackMessageContext = createContext<() => JSX.Element | null>(() => null);

function FeedbackProvider({ children }: { children: React.ReactElement }) {
  const [alerts, setAlerts] = useState([]);
  const userAlerter = new UserAlerter(alerts, setAlerts);

  const emitSuccessMessage = (message: string) => userAlerter.flashSuccessMessage(message);
  const emitErrorMessage = (message: string) => userAlerter.setErrorMessage(message);
  const emitWarningMessage = (message: string) => userAlerter.setWarningMessage(message);

  return (
    <FeedbackEmitContext.Provider value={{ emitSuccessMessage, emitErrorMessage, emitWarningMessage }}>
      <FeedbackMessageContext.Provider value={userAlerter.alertComponent()}>{children}</FeedbackMessageContext.Provider>
    </FeedbackEmitContext.Provider>
  );
}

export const useFeedbackMessage = () => useContext(FeedbackMessageContext);
export const useFeedBackEmit = () => useContext(FeedbackEmitContext);

export default FeedbackProvider;
