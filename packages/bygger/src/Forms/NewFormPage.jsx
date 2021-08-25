import React, { useState } from "react";
import PropTypes from "prop-types";
import { Hovedknapp } from "nav-frontend-knapper";
import { CreationFormMetadataEditor } from "../components/FormMetadataEditor";
import cloneDeep from "lodash.clonedeep";
import { AppLayoutWithContext } from "../components/AppLayout";
import { defaultFormFields } from "./DefaultForm";
import { navFormUtils, stringUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    margin: "0 auto 2rem",
    maxWidth: "50rem",
  },
});

const NewFormPage = ({ onCreate, onLogout }) => {
  const styles = useStyles();
  const [state, setState] = useState({
    form: {
      tags: ["nav-skjema", ""],
      type: "form",
      display: "wizard",
      name: "",
      title: "",
      path: "",
      properties: {
        skjemanummer: "",
        tema: "",
        hasPapirInnsendingOnly: false,
        hasLabeledSignatures: false,
        signatures: { signature1: "", signature2: "", signature3: "", signature4: "", signature5: "" },
      },
      components: defaultFormFields(),
    },
  });

  const setForm = (form) => {
    const newForm = cloneDeep(form);
    setState((oldState) => {
      if (oldState.form.properties.skjemanummer !== newForm.properties.skjemanummer) {
        newForm.name = stringUtils.camelCase(newForm.properties.skjemanummer);
        newForm.path = navFormUtils.toFormPath(newForm.properties.skjemanummer);
      }
      return { form: newForm };
    });
  };

  return (
    <AppLayoutWithContext navBarProps={{ title: "Opprett nytt skjema", visSkjemaliste: true, logout: onLogout }}>
      <main className={styles.root}>
        <CreationFormMetadataEditor form={state.form} onChange={setForm} />
        <Hovedknapp onClick={() => onCreate(state.form)}>Opprett</Hovedknapp>
      </main>
    </AppLayoutWithContext>
  );
};

NewFormPage.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default NewFormPage;
