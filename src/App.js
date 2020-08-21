import React, { useMemo } from "react";
import { UserAlerterContext, useUserAlerting } from "./userAlerting";
import { useAuth } from "./context/AuthProvider";
import Formiojs from "formiojs/Formio";
//import UnauthenticatedApp from "./UnauthenticatedApp";
import AuthenticatedApp from "./AuthenticatedApp";

function App({ projectURL, store, pusher }) {
  const userAlerter = useUserAlerting(pusher);
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  return <AuthenticatedApp formio={formio} store={store} />
  //return <UnauthenticatedApp projectURL={projectURL} />;
}

export default App;
