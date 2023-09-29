import { FormioTranslationMap } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useCallback } from "react";
import I18nStateProvider from "../context/i18n";
import TranslationsByFormPage from "./TranslationsByFormPage";
import { useParams } from "react-router-dom";

interface TranslationRouteProps {
  loadTranslationsForEditPage: (formPath: string) => Promise<FormioTranslationMap>;
  loadForm: any;
  saveLocalTranslation: any;
}

export const TranslationsByFormRoute = ({
  loadTranslationsForEditPage,
  loadForm,
  saveLocalTranslation,
}: TranslationRouteProps) => {
  const { formPath } = useParams();
  const loadTranslations = useCallback(
    () => loadTranslationsForEditPage(formPath!),
    [formPath, loadTranslationsForEditPage],
  );

  return (
    <I18nStateProvider loadTranslations={loadTranslations}>
      <TranslationsByFormPage loadForm={loadForm} saveTranslation={saveLocalTranslation} />
    </I18nStateProvider>
  );
};
