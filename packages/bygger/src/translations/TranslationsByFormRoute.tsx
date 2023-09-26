import { FormioTranslationMap } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useCallback } from "react";
import I18nStateProvider from "../context/i18n";
import TranslationsByFormPage from "./TranslationsByFormPage";

interface TranslationRouteProps {
  formPath: string;
  loadTranslationsForEditPage: (formPath: string) => Promise<FormioTranslationMap>;
  loadForm: any;
  saveLocalTranslation: any;
}

export const TranslationsByFormRoute = ({
  formPath,
  loadTranslationsForEditPage,
  loadForm,
  saveLocalTranslation,
}: TranslationRouteProps) => {
  const loadTranslations = useCallback(
    () => loadTranslationsForEditPage(formPath),
    [formPath, loadTranslationsForEditPage],
  );

  return (
    <I18nStateProvider loadTranslations={loadTranslations}>
      <TranslationsByFormPage loadForm={loadForm} saveTranslation={saveLocalTranslation} />
    </I18nStateProvider>
  );
};
