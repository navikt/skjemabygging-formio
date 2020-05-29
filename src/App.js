import React, {useMemo} from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";

function App({ projectURL, store }) {
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);

  return userData ? <AuthenticatedApp formio={formio} store={store} /> : <UnauthenticatedApp projectURL={projectURL} />;
}
export default App;
