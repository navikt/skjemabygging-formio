import { NavBar } from "./components/NavBar";
import NavForm from "./components/NavForm";
import React from "react";
import {useAuth} from "./context/auth-context";

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  return (
    <>
      <NavBar />
      <NavForm src={`${projectURL}/admin/login`} onSubmitDone={(user) => login(user)} />
    </>
  );
};

export default UnauthenticatedApp;
