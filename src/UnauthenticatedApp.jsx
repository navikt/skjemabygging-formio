import { NavBar } from "./components/NavBar";
import NavForm from "./components/NavForm";
import React from "react";
import {useAuth} from "./context/auth-context";
import {Pagewrapper} from "./Forms/components";
import i18nData from "./i18nData";

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  return (
    <>
      <NavBar title={"Skjemabygger"} options={{
        language: 'nb-NO',
        i18n: i18nData
      }} />
      <Pagewrapper><NavForm src={`${projectURL}/user/login`} onSubmitDone={(user) => login(user)} /></Pagewrapper>
    </>
  );
};

export default UnauthenticatedApp;
