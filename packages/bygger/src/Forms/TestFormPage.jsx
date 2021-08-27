import React from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FyllUtRouter, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { useTranslations } from "../context/i18n";
import ActionRow from "../components/layout/ActionRow";

export function TestFormPage({ editFormUrl, form, formSettingsUrl, onLogout }) {
  const { featureToggles } = useAppConfig();
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const currentLanguage = params.get("lang");
  const { translations } = useTranslations();

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
      <FyllUtRouter form={form} translations={featureToggles.enableTranslations ? translations : undefined} />
    </AppLayoutWithContext>
  );
}
