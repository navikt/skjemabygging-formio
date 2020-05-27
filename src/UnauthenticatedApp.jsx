import { NavBar } from "./components/NavBar";
import Form from "./react-formio/Form";
import React from "react";
import {useAuth} from "./context/auth-context";

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  return (
    <>
      <NavBar />
      <Form src={`${projectURL}/admin/login`} onSubmitDone={(user) => login(user)} />
    </>
  );
};

export default UnauthenticatedApp;
