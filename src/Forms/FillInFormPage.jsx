import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { loggSkjemaSporsmalBesvart, loggSkjemaStartet } from "../util/amplitude";

const hasFieldValueChanged = (previousValue, newValue) => previousValue !== newValue;
const getFieldValueIfChanged = (event, lastFormState) => {
  if (hasFieldValueChanged(lastFormState[event.component.key], event._data[event.component.key])) {
    return event._data[event.component.key];
  }
};

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const [lastFormState] = useState({});
  const [hasStartedFillingOutForm, setHasStartedFillingOutForm] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const history = useHistory();
  useEffect(() => {
    if (lastEvent && lastEvent._data[lastEvent.component.key] && !hasStartedFillingOutForm) {
      loggSkjemaStartet(form);
      setHasStartedFillingOutForm(true);
    }
  }, [form, hasStartedFillingOutForm, lastEvent]);
  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        submission={submission}
        onBlur={(event) => {
          const previousState = lastFormState;
          loggSkjemaSporsmalBesvart(
            form,
            event.component.label,
            event.component.key,
            getFieldValueIfChanged(event, previousState),
            event.component.validate.required
          );
        }}
        onSubmit={(submission) => {
          setSubmission(submission);
          history.push(`${formUrl}/oppsummering`);
        }}
      />
    </main>
  );
};
