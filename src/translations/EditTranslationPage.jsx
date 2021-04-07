import React from "react";
import { useHistory } from "react-router-dom";
import NavForm from "../components/NavForm";
import { styled } from "@material-ui/styles";
import { AppLayoutWithContext } from "../components/AppLayout";
import { SlettKnapp } from "../Forms/components";

const StyledNavForm = styled(NavForm)({
  margin: "0 auto",
  maxWidth: "26.25rem",
});

const EditTranslationPage = ({ projectURL, resourceId, deleteLanguage }) => {
  const history = useHistory();
  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rediger oversettelse",
        visSkjemaliste: false,
        visLagNyttSkjema: false,
        visOversettelseliste: true,
      }}
      rightCol={
        <SlettKnapp
          className="lenke"
          onClick={() => deleteLanguage(resourceId).then(() => history.push("/translations"))}
        >
          Slett oversettelser
        </SlettKnapp>
      }
    >
      <StyledNavForm src={`${projectURL}/language/submission/${resourceId}`} />
    </AppLayoutWithContext>
  );
};

export default EditTranslationPage;
