import React from "react";
import NavForm from "../components/NavForm";
import { styled } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const EditResourcePage = ({ projectURL, resourceId }) => {
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rediger oversettelse",
        visSkjemaliste: true,
        visLagNyttSkjema: false,
      }}
    >
      <StyledNavForm src={`${projectURL}/language/submission/${resourceId}`} onSubmitDone={() => alert("Saved!")} />
    </AppLayoutWithContext>
  );
};

export default EditResourcePage;
