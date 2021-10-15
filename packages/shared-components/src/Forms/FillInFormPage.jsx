import React, { useEffect } from "react";
import {useHistory, useParams} from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { useAppConfig } from "../configContext";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { featureToggles } = useAppConfig();
  const { currentLanguage, translate, translationsForNavForm } = useLanguages();
  const { panel } = useParams();

  useEffect(() => {
    window.form = window.form || { pages: [] };
    if(panel && window.form.pages.find(page => page.path === panel)) {
      window.form.setPage(window.form.pages.map(page => page.path).indexOf(panel));
    }
  }, [panel]);

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }
  return (
    <div>
      <Sidetittel>{translate(form.title)}</Sidetittel>
      {form.properties && form.properties.skjemanummer && <p>{form.properties.skjemanummer}</p>}
      <NavForm
        form={form}
        formUrl={formUrl}
        language={featureToggles.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles.enableTranslations ? translationsForNavForm : undefined}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onChange={(event) => loggSkjemaSporsmalForSpesialTyper(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          const urlSearchParams = new URLSearchParams(window.location.search).toString();
          history.push(`${formUrl}/oppsummering?${urlSearchParams}`);
        }}
      />
    </div>
  );
};
