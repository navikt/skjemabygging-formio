import { NavFormioJs } from "@navikt/skjemadigitalisering-shared-components";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

interface UserData {
  name?: string;
  preferredUsername?: string;
  NAVident?: string;
  isAdmin: boolean;
  data?: {
    email: string;
  };
}

interface ContextProps {
  userData?: UserData;
  login?: Function;
  logout?: Function;
}

const enforceUserName = (formioUser) => {
  if (formioUser && !formioUser.name) {
    return {
      ...formioUser,
      name: formioUser.data?.email,
      isAdmin: true,
    };
  }
  return formioUser;
};

const AuthContext = React.createContext<ContextProps>({});
function AuthProvider(props) {
  const [userData, setUserData] = useState(props.user || enforceUserName(NavFormioJs.Formio.getUser()));
  const history = useHistory();

  const login = (user) => {
    setUserData(enforceUserName(user));
    history.push("/forms");
  };
  const logout = async () => {
    try {
      setUserData(null);
      await NavFormioJs.Formio.logout();
    } finally {
      const { origin } = window.location;
      window.location.replace(`${origin}/oauth2/logout`);
    }
  };
  return <AuthContext.Provider value={{ userData, login, logout }} {...props} />;
}
const useAuth = () => React.useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
