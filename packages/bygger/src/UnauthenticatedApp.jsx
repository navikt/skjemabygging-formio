import { styled } from "@material-ui/styles";
import { NavForm, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { NavBar } from "./components/NavBar";
import { useAuth } from "./context/auth-context";
import { Pagewrapper } from "./Forms/components";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  const { config } = useAppConfig();
  return (
    <>
      <NavBar title={"Skjemabygger"} />
      <Pagewrapper>
        {config?.isDevelopment ? (
          <StyledNavForm src={`${projectURL}/user/login`} onSubmitDone={(user) => login(user)} />
        ) : (
          <div>Du er logget ut</div>
        )}
      </Pagewrapper>
    </>
  );
};

export default UnauthenticatedApp;
