import React, {useState} from "react";
import Formiojs from "formiojs/Formio";

const AuthContext = React.createContext();
function AuthProvider(props) {
  const [userData, setUserData] = useState(Formiojs.getUser());

  const login = (user) => {
    setUserData(user);
  };
  const logout = () => {
    Formiojs.logout();
    setUserData(null);
  };
  return <AuthContext.Provider value={{ userData, login, logout }} {...props} />;
}
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };