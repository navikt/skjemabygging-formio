import { FyllUtRouter, useAppConfig, useLanguageCodeFromURL } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { Link } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import ActionRow from "../components/layout/ActionRow";
import { useTranslations } from "../context/i18n";

export function TestFormPage({ editFormUrl, form, formSettingsUrl }) {
  const { featureToggles } = useAppConfig();
  const currentLanguage = useLanguageCodeFromURL();
  const { translationsForNavForm } = useTranslations();

  return (
    <AppLayoutWithContext navBarProps={{ title: "Forhåndsvisning", visSkjemaliste: true }}>
      <ActionRow>
        {formSettingsUrl && (
          <Link className="knapp" to={formSettingsUrl}>
            Innstillinger
          </Link>
        )}
        <Link className="knapp" to={editFormUrl}>
          Rediger
        </Link>
        {featureToggles.enableTranslations && (
          <Link className="knapp" to={`/translations/${form.path}${currentLanguage ? `/${currentLanguage}` : ""}`}>
            Oversettelse
          </Link>
        )}
      </ActionRow>
      <FyllUtRouter form={form} translations={featureToggles.enableTranslations && translationsForNavForm} />
    </AppLayoutWithContext>
  );
}
