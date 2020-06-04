import { NavBar } from "./components/NavBar";
import NAVForm from "./components/NAVForm";
import React from "react";
import {useAuth} from "./context/auth-context";

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  return (
    <>
      <NavBar />
      <form><NAVForm src={`${projectURL}/admin/login`} onSubmitDone={(user) => login(user)} /></form>
    </>
  );
};

export default UnauthenticatedApp;
