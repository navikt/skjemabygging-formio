import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import React, { MouseEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  login?: (user: UserData) => void;
  logout?: MouseEventHandler<HTMLAnchorElement> | undefined;
}

const enforceUserName = (formioUser: UserData) => {
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
  const navigate = useNavigate();

  const login = (user: UserData) => {
    setUserData(enforceUserName(user));
    navigate('/forms');
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
