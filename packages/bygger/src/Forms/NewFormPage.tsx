import { makeStyles } from "@material-ui/styles";
import { Component, NavFormType, navFormUtils, stringUtils } from "@navikt/skjemadigitalisering-shared-domain";
import cloneDeep from "lodash.clonedeep";
import { Hovedknapp } from "nav-frontend-knapper";
import { Sidetittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { AppLayout } from "../components/AppLayout";
import { CreationFormMetadataEditor } from "../components/FormMetaDataEditor/FormMetadataEditor";
import { isFormMetadataValid, validateFormMetadata } from "../components/FormMetaDataEditor/utils";
import { useFeedBackEmit } from "../context/notifications/feedbackContext";
import { defaultFormFields } from "./DefaultForm";

const useStyles = makeStyles({
  root: {
    margin: "0 auto 2rem",
    maxWidth: "50rem",
  },
  centerColumn: {
    gridColumn: "2 / 3",
  },
});

interface Props {
  formio: any;
}

interface State {
  form: NavFormType;
}

const NewFormPage: React.FC<Props> = ({ formio }): React.ReactElement => {
  const feedbackEmit = useFeedBackEmit();
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

  const [errors, setErrors] = useState({});

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
  const validateAndSave = async (form) => {
    const updatedErrors = validateFormMetadata(form);
    const trimmedFormNumber = state.form.properties.skjemanummer.trim();
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      return await formio
        .saveForm({ ...state.form, properties: { ...state.form.properties, skjemanummer: trimmedFormNumber } })
        .then((form) => {
          feedbackEmit.success(`Opprettet skjemaet ${form.title}`);
          history.push(`/forms/${form.path}/edit`);
        });
    } else {
      setErrors(updatedErrors);
    }
  };

  const onCreate = () => {
    validateAndSave(state.form);
  };

  return (
    <AppLayout navBarProps={{ title: "Opprett nytt skjema" }}>
      <main className={styles.root}>
        <Sidetittel className="margin-bottom-double">Opprett nytt skjema</Sidetittel>
        <CreationFormMetadataEditor form={state.form} onChange={setForm} errors={errors} />
        <Hovedknapp onClick={onCreate}>Opprett</Hovedknapp>
      </main>
    </AppLayout>
  );
};

export default NewFormPage;
