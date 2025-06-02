import { FyllUtRouter, i18nUtils, LoadingComponent } from '@navikt/skjemadigitalisering-shared-components';
import { externalStorageTexts } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { loadCountryNamesForLanguages, loadFormTranslations, loadGlobalTranslationsForLanguages } from '../../util/api';

function FormPage({ form }) {
  const [translation, setTranslation] = useState({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    async function fetchTranslations() {
      const localTranslationsForForm: any = await loadFormTranslations(form.path);
      const availableLanguages = Object.keys(localTranslationsForForm);
      const countryNameTranslations = await loadCountryNamesForLanguages(availableLanguages);
      const initValuesForKeyBasedGlobalTranslations = i18nUtils.mapFormsApiTranslationsToI18n(
        externalStorageTexts.initValues.introPage,
      );
      const globalTranslations = await loadGlobalTranslationsForLanguages(availableLanguages);

      return availableLanguages.reduce(
        (accumulated, lang) => ({
          ...accumulated,
          [lang]: {
            ...accumulated[lang],
            ...countryNameTranslations[lang],
            ...initValuesForKeyBasedGlobalTranslations[lang],
            ...globalTranslations[lang],
            ...localTranslationsForForm[lang],
          },
        }),
        { 'nb-NO': i18nUtils.initialData['nb-NO'] },
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

  return <FyllUtRouter form={form} translations={translation} />;
}

export default FormPage;
