import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import { UserAlerterContext, useUserAlerting } from "./userAlerting";
import { Formio } from "formiojs";
import navdesign from "template";

Formio.use(navdesign);

function App({ projectURL, store, pusher }) {
  const userAlerter = useUserAlerting(pusher);
  console.log("userAlerter", userAlerter);
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const contentFunc = userData
    ? () => <AuthenticatedApp formio={formio} store={store} />
    : () => <UnauthenticatedApp projectURL={projectURL} />;
  return (
    <UserAlerterContext.Provider value={userAlerter}>
      <section>{contentFunc()}</section>
    </UserAlerterContext.Provider>
  );
}

export default App;
