import React, { useEffect, useState } from "react";
import { AmplitudeProvider, FyllUtRouter } from "@navikt/skjemadigitalisering-shared-components";

function FormPage({ form }) {
  const [translation, setTranslation] = useState(undefined);
  useEffect(() => {
    fetch(`/fyllut/translations/${form.path}`, { headers: { accept: "application/json" } }).then((response) => {
      response.json().then(setTranslation);
    });
  }, [form]);

  if (translation) {
    return (
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <FyllUtRouter form={form} translations={translation} />
      </AmplitudeProvider>
    );
  }
  return <></>;
}

export default FormPage;
