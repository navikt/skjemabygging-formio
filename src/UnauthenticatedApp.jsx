import { NavBar } from "./components/NavBar";
import NavForm from "./components/NavForm";
import React from "react";
import {useAuth} from "./context/auth-context";

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  return (
    <>
      <NavBar />
      <form><NavForm src={`${projectURL}/admin/login`} onSubmitDone={(user) => login(user)} /></form>
    </>
  );
};

export default UnauthenticatedApp;
