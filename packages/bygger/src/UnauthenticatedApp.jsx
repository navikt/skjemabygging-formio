import React from "react";
import { styled } from "@material-ui/styles";
import { NavBar } from "./components/NavBar";
import NavForm from "./components/NavForm";
import { useAuth } from "./context/auth-context";
import { Pagewrapper } from "./Forms/components";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  return (
    <>
      <NavBar title={"Skjemabygger"} />
      <Pagewrapper>
        <StyledNavForm src={`${projectURL}/user/login`} onSubmitDone={(user) => login(user)} />
      </Pagewrapper>
    </>
  );
};

export default UnauthenticatedApp;
