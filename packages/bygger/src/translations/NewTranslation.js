import React from "react";
import { Pagewrapper } from "../Forms/components";
import { styled } from "@material-ui/styles";
import { NavForm } from "@navikt/skjemadigitalisering-shared-components";
import { AppLayoutWithContext } from "../components/AppLayout";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const NewTranslation = ({ projectURL, onLogout }) => (
  <AppLayoutWithContext
    navBarProps={{
      title: "Oversettelser",
      visOversettelseliste: true,
      visLagNyttSkjema: false,
      logout: onLogout,
    }}
  >
    <Pagewrapper>
      <StyledNavForm src={`${projectURL}/language`} />
    </Pagewrapper>
  </AppLayoutWithContext>
);

export default NewTranslation;
