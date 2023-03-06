import { FyllUtRouter, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { AppLayout } from "../components/AppLayout";
import { useI18nState } from "../context/i18n/I18nContext";

export function TestFormPage({ form, visSkjemaMeny }) {
  const { featureToggles } = useAppConfig();
  const { translationsForNavForm } = useI18nState();

  return (
    <AppLayout
      navBarProps={{
        title: "Forhåndsvisning",
        visSkjemaMeny: true,
        formPath: form.path,
      }}
    >
      <FyllUtRouter form={form} translations={featureToggles.enableTranslations && translationsForNavForm} />
    </AppLayout>
  );
}
