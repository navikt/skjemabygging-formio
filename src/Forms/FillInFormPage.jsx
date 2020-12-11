import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { loggSkjemaSporsmalBesvart, loggSkjemaStartet } from "../util/amplitude";

const hasFieldValueChanged = (previousValue, newValue) => previousValue !== newValue;

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const [hasStartedFillingOutForm, setHasStartedFillingOutForm] = useState(false);
  const [lastFormState, setLastFormState] = useState({});
  const [lastEvent, setLastEvent] = useState(null);
  const history = useHistory();
  useEffect(() => {
    if (lastEvent && lastEvent._data[lastEvent.component.key] && !hasStartedFillingOutForm) {
      loggSkjemaStartet(form);
      setHasStartedFillingOutForm(true);
    }
  }, [form, hasStartedFillingOutForm, lastEvent]);
  useEffect(() => {
    if (lastEvent) {
      const componentKey = lastEvent.component.key;
      if (hasFieldValueChanged(lastFormState[componentKey], lastEvent._data[componentKey])) {
        setLastFormState({ ...lastEvent._data });
        loggSkjemaSporsmalBesvart(
          form,
          lastEvent.component.label,
          lastEvent.component.key,
          lastEvent._data[componentKey],
          lastEvent.component.validate.required
        );
      }
    }
  }, [form, lastEvent, lastFormState]);
  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        submission={submission}
        onBlur={(event) => setLastEvent(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          history.push(`${formUrl}/oppsummering`);
        }}
      />
    </main>
  );
};
