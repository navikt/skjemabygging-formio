import React from 'react'
import AuthenticatedApp from './AuthenticatedApp'
import UnauthenticatedApp from './UnauthenticatedApp'
import {useAuth} from "./context/auth-context";
import {BrowserRouter} from "react-router-dom";

function App({ projectURL, store }) {
  const { userData } = useAuth();
  return (
    <BrowserRouter>
      {console.log(userData)}
      {userData ? <AuthenticatedApp projectURL={projectURL} store={store} /> : <UnauthenticatedApp projectURL={projectURL} />}
    </BrowserRouter>
  );
}
export default App;