import { styled } from "@material-ui/styles";
import { NavForm } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import { Pagewrapper } from "../Forms/components";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const NewTranslation = ({ projectURL }) => (
  <AppLayoutWithContext
    navBarProps={{
      title: "Oversettelser",
      visOversettelseliste: true,
      visLagNyttSkjema: false,
    }}
  >
    <Pagewrapper>
      <StyledNavForm src={`${projectURL}/language`} />
    </Pagewrapper>
  </AppLayoutWithContext>
);

export default NewTranslation;
