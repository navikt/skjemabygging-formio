import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import Formiojs from "formiojs/Formio";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

interface UserData {
  name?: string;
  preferredUsername?: string;
  NAVident?: string;
  data?: {
    email: string;
  };
}

interface ContextProps {
  userData?: UserData;
  login?: Function;
  logout?: Function;
}

const AuthContext = React.createContext<ContextProps>({});
function AuthProvider(props) {
  const [userData, setUserData] = useState(props.user || Formiojs.getUser());
  const history = useHistory();
  const { http } = useAppConfig();

  const login = (user) => {
    setUserData(user);
    history.push("/forms");
  };
  const logout = async () => {
    try {
      await Formiojs.logout();
      setUserData(null);
    } finally {
      http?.get("/oauth2/logout", {}, { redirectToLocation: true });
    }
  };
  return <AuthContext.Provider value={{ userData, login, logout }} {...props} />;
}
const useAuth = () => React.useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
