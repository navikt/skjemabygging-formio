import {
  AmplitudeProvider,
  FyllUtRouter,
  i18nData,
  LoadingComponent,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useState } from 'react';
import { loadCountryNamesForLanguages, loadFormTranslations, loadGlobalTranslationsForLanguages } from '../api';

function FormPage({ form }) {
  const [translation, setTranslation] = useState({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    async function fetchTranslations() {
      const localTranslationsForForm = await loadFormTranslations(form.path);
      const availableLanguages = Object.keys(localTranslationsForForm);
      const countryNameTranslations = await loadCountryNamesForLanguages(availableLanguages);
      const globalTranslations = await loadGlobalTranslationsForLanguages(availableLanguages);

      return availableLanguages.reduce(
        (accumulated, lang) => ({
          ...accumulated,
          [lang]: {
            ...accumulated[lang],
            ...countryNameTranslations[lang],
            ...globalTranslations[lang],
            ...localTranslationsForForm[lang],
          },
        }),
        { 'nb-NO': i18nData['nb-NO'] },
      );
    }
    fetchTranslations().then((completeI18n) => {
      setReady(true);
      if (Object.keys(completeI18n).length > 0) {
        setTranslation(completeI18n);
      }
    });
  }, [form]);

  if (!ready) {
    return <LoadingComponent />;
  }

  return (
    <AmplitudeProvider form={form}>
      <FyllUtRouter form={form} translations={translation} />
    </AmplitudeProvider>
  );
}

export default FormPage;
