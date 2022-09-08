import { FyllUtRouter, useAppConfig, useLanguageCodeFromURL } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { AppLayoutWithContext } from "../components/AppLayout";
import { useI18nState } from "../context/i18n/I18nContext";

export function TestFormPage({ editFormUrl, testFormUrl, form, formSettingsUrl, visSkjemaMeny }) {
  const { featureToggles } = useAppConfig();
  const currentLanguage = useLanguageCodeFromURL();
  const { translationsForNavForm } = useI18nState();

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Forhåndsvisning",
        visSkjemaMeny: true,
        links: [
          {
            label: "Innstillinger",
            url: formSettingsUrl,
          },
          {
            label: "Forhåndsvis",
            url: testFormUrl,
          },
          {
            label: "Rediger skjema",
            url: editFormUrl,
          },
          {
            label: "Språk",
            url: `/translations/${form.path}${currentLanguage ? `/${currentLanguage}` : ""}`,
          },
        ],
      }}
    >
      <FyllUtRouter form={form} translations={featureToggles.enableTranslations && translationsForNavForm} />
    </AppLayoutWithContext>
  );
}
