import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import {
  FyllUtRouter,
  useAppConfig,
  i18nData,
  useLanguageCodeFromURL,
} from "@navikt/skjemadigitalisering-shared-components";
import { useTranslations } from "../context/i18n";
import ActionRow from "../components/layout/ActionRow";

export function TestFormPage({ editFormUrl, form, formSettingsUrl, onLogout }) {
  const { featureToggles } = useAppConfig();
  const currentLanguage = useLanguageCodeFromURL();
  const { getTranslationsForNavForm, getCountryNameTranslations } = useTranslations();

  const translationsForNavForm = useMemo(() => getTranslationsForNavForm(), [getTranslationsForNavForm]);
  const countryNameTranslations = useMemo(() => getCountryNameTranslations(), [getCountryNameTranslations]);

  const i18nNorskData = { "nb-NO": i18nData["nb-NO"] };

  return (
    <AppLayoutWithContext navBarProps={{ title: "Forhåndsvisning", visSkjemaliste: true, logout: onLogout }}>
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
      <FyllUtRouter
        form={form}
        translations={featureToggles.enableTranslations && { ...i18nNorskData, ...translationsForNavForm }}
        countryNameTranslations={featureToggles.enableTranslations && countryNameTranslations}
      />
    </AppLayoutWithContext>
  );
}
