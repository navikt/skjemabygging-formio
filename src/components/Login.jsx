import { NavBar } from "./NavBar";
import Form from "../react-formio/Form";
import React from "react";

const Login = ({ projectURL }) => {
  return (
    <div>
      {/*Login-komponent*/}
      <NavBar />
      <Form
        src={`${projectURL}/admin/login`}
      />
    </div>
  );
};

export default Login;
