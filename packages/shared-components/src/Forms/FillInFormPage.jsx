import React from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { getPanelSlug } from "../util/form";
import { FormTitle } from "./components/FormTitle";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { featureToggles } = useAppConfig();
  const { currentLanguage, translationsForNavForm } = useLanguages();
  const { search } = useLocation();
  const { panelSlug } = useParams();

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  function updatePanelUrl(panelPath) {
    history.push({ pathname: `${formUrl}/${panelPath}`, search });
  }

  function onNextOrPreviousPage({ page }) {
    const pathOfPanel = getPanelSlug(form, page);
    if (pathOfPanel) {
      updatePanelUrl(pathOfPanel);
    }
  }

  function onWizardPageSelected(panel) {
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    if (!panelSlug) {
      const pathOfPanel = getPanelSlug(form, 0);
      updatePanelUrl(pathOfPanel);
    } else {
      if (typeof formioInstance?.setPage === "function") {
        const panelIndex = formioInstance.currentPanels.indexOf(panelSlug);
        if (panelIndex >= 0) {
          formioInstance.setPage(panelIndex);
        } else {
          formioInstance.setPage(0);
        }
      }
    }
  }

  const onSubmit = (submission) => {
    setSubmission(submission);
    history.push({ pathname: `${formUrl}/oppsummering`, search });
  };

  return (
    <div>
      <FormTitle form={form} />
      <NavForm
        form={form}
        language={featureToggles.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles.enableTranslations ? translationsForNavForm : undefined}
        submission={submission}
        onBlur={loggSkjemaSporsmalBesvart}
        onChange={loggSkjemaSporsmalForSpesialTyper}
        onSubmit={onSubmit}
        onNextPage={onNextOrPreviousPage}
        onPrevPage={onNextOrPreviousPage}
        formReady={onFormReady}
        onWizardPageSelected={onWizardPageSelected}
      />
    </div>
  );
};
