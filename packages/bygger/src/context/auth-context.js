import React, { useState } from "react";
import Formiojs from "formiojs/Formio";
import { useHistory } from "react-router-dom";

const AuthContext = React.createContext();
function AuthProvider(props) {
  const [userData, setUserData] = useState(Formiojs.getUser());
  const history = useHistory();

  const login = (user) => {
    setUserData(user);
    history.push("/forms");
  };
  const logout = () => {
    Formiojs.setToken("");
    Formiojs.logout();
    setUserData(null);
  };
  return <AuthContext.Provider value={{ userData, login, logout }} {...props} />;
}
const useAuth = () => React.useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
