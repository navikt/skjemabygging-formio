import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import { UserAlerterContext, useUserAlerting } from "./userAlerting";

function App({ projectURL, store, pusher }) {
  const userAlerter = useUserAlerting(pusher);
  console.log('userAlerter', userAlerter);
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <UserAlerterContext.Provider value={userAlerter}>
      <AuthenticatedApp formio={formio} store={store} />
    </UserAlerterContext.Provider>
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <section>{content}</section>;
}

export default App;
