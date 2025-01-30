import { Skeleton } from '@navikt/ds-react';
import { FyllUtRouter, getCountries, SkeletonList, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation, I18nTranslationMap, I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { AppLayout } from '../components/AppLayout';
import RowLayout from '../components/layout/RowLayout';
import { useFormTranslations } from '../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../context/translations/GlobalTranslationsContext';

// TODO: move
type FormioFormatLang = 'nb-NO' | 'nn-NO' | 'en';
const formioFormatToStandard = (lang: string): string => lang.substring(0, 2);
const mapFormsApiTranslationsToI18n = (translations: FormsApiTranslation[]): I18nTranslations => {
  const initial: I18nTranslations = { 'nb-NO': {}, 'nn-NO': {}, en: {} };

  const nbCountryNames = Object.fromEntries(getCountries('nb').map(({ label, value }) => [value, label]));

  return translations.reduce<I18nTranslations>((acc, translation) => {
    return Object.fromEntries(
      Object.entries(acc)
        // Legg til oversettelser fra forms-api
        .map(([language, values]): [string, I18nTranslationMap] => {
          const formsApiValueForLanguage = translation[formioFormatToStandard(language)];
          if (formsApiValueForLanguage) {
            return [language, { ...values, [translation.key]: formsApiValueForLanguage }];
          } else {
            return [language, values];
          }
        })
        // Legg til oversettelser fra i18n-iso-countries
        .map(([language, values]) => [
          language,
          {
            ...values,
            ...Object.fromEntries(
              getCountries(language as FormioFormatLang).map(({ label, value }) => [nbCountryNames[value], label]),
            ),
          },
        ]),
    );
  }, initial);
};

export function TestFormPage({ form }) {
  const { featureToggles } = useAppConfig();
  const { isReady: formTranslationIsReady, translations: formTranslations } = useFormTranslations();
  const { isReady: globalTranslationIsReady, translations: globalTranslations } = useGlobalTranslations();

  const i18n = useMemo(() => {
    if (!(formTranslationIsReady && globalTranslationIsReady)) return undefined;
    return mapFormsApiTranslationsToI18n([...formTranslations, ...globalTranslations]);
  }, [formTranslationIsReady, formTranslations, globalTranslationIsReady, globalTranslations]);

  if (!(form && formTranslationIsReady && globalTranslationIsReady)) {
    return (
      <>
        <RowLayout>
          <Skeleton height={'16rem'} />
          <SkeletonList size={8} height={'4rem'} />
        </RowLayout>
      </>
    );
  }

  // const { translationsForNavForm } = useI18nState();

  return (
    <AppLayout
      navBarProps={{
        formMenu: true,
        formPath: form.path,
      }}
    >
      <FyllUtRouter form={form} translations={featureToggles?.enableTranslations && i18n} />
    </AppLayout>
  );
}
