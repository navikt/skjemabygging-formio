import React from "react";
import { Pagewrapper } from "../Forms/components";
import { styled } from "@material-ui/styles";
import NavForm from "../components/NavForm";
import { AppLayoutWithContext } from "../components/AppLayout";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const NewResource = ({ projectURL }) => (
  <AppLayoutWithContext
    navBarProps={{
      title: "Oversettelser",
      visOversettelseliste: true,
      visLagNyttSkjema: false,
    }}
  >
    <Pagewrapper>
      <StyledNavForm src={`${projectURL}/language`} onSubmitDone={() => alert("Saved!")} />
    </Pagewrapper>
  </AppLayoutWithContext>
);

export default NewResource;
