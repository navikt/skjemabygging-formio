import { makeStyles } from "@material-ui/styles";
import { Component, NavFormType, navFormUtils, stringUtils } from "@navikt/skjemadigitalisering-shared-domain";
import cloneDeep from "lodash.clonedeep";
import { Hovedknapp } from "nav-frontend-knapper";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { AppLayoutWithContext } from "../components/AppLayout";
import { CreationFormMetadataEditor } from "../components/FormMetadataEditor";
import { UserAlerterContext } from "../userAlerting";
import { defaultFormFields } from "./DefaultForm";

const useStyles = makeStyles({
  root: {
    margin: "0 auto 2rem",
    maxWidth: "50rem",
  },
});

interface Props {
  formio: any;
}

interface State {
  form: NavFormType;
}

const NewFormPage: React.FC<Props> = ({ formio }): React.ReactElement => {
  const userAlerter = useContext(UserAlerterContext);
  const history = useHistory();
  const styles = useStyles();
  const [state, setState] = useState<State>({
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
        innsending: "PAPIR_OG_DIGITAL",
        signatures: [{ label: "", description: "", key: uuidv4() }],
      },
      components: defaultFormFields() as unknown as Component[],
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

  const onCreate = () => {
    formio.saveForm(state.form).then((form) => {
      userAlerter.flashSuccessMessage("Opprettet skjemaet " + form.title);
      history.push(`/forms/${form.path}/edit`);
    });
  };

  return (
    <AppLayoutWithContext navBarProps={{ title: "Opprett nytt skjema", visSkjemaliste: true }}>
      <main className={styles.root}>
        <CreationFormMetadataEditor form={state.form} onChange={setForm} />
        <Hovedknapp onClick={onCreate}>Opprett</Hovedknapp>
      </main>
    </AppLayoutWithContext>
  );
};

export default NewFormPage;
