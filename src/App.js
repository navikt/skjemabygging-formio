import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import { AlertContainer, useUserAlerting } from "./userAlerting";

function App({ projectURL, store, pusher }) {
  const userAlerter = useUserAlerting(pusher);
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const content = userData ? (
    <AuthenticatedApp formio={formio} store={store} userAlerter={userAlerter} />
  ) : (
    <UnauthenticatedApp projectURL={projectURL} />
  );
  return <>
   {/* <AlertContainer>{userAlerter.alertComponent()}</AlertContainer>*/}
    <section>{content}</section>
  </>;
}

export default App;
