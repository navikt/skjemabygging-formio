import React from "react";
import { useHistory, useParams } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { getPanelPaths, getPanelSlug } from "../util/form";
import { FormTitle } from "./components/FormTitle";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { featureToggles } = useAppConfig();
  const { currentLanguage, translationsForNavForm } = useLanguages();
  const { panelSlug } = useParams();
  const panelPaths = getPanelPaths(form.components);

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  function getCurrentPanelPath() {
    const result = window.location.pathname.split("/");
    return result[result.length - 1];
  }

  function updatePanelUrl(panelPath) {
    const current = getCurrentPanelPath();
    if (panelPath !== current && panelPaths.includes(current)) {
      history.push({ pathname: `${formUrl}/${panelPath}`, search: window.location.search });
    }
  }

  function goToPanelFromUrlParam(formioInstance) {
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

  function onNextOrPreviousPage({ page, currentPanels }) {
    if (page <= currentPanels.length - 1) {
      updatePanelUrl(currentPanels[page]);
    }
  }

  function onWizardPageSelected(panel) {
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    goToPanelFromUrlParam(formioInstance);
  }

  const onSubmit = (submission) => {
    setSubmission(submission);
    history.push({ pathname: `${formUrl}/oppsummering`, search: window.location.search });
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
        submissionReady={goToPanelFromUrlParam}
        onWizardPageSelected={onWizardPageSelected}
      />
    </div>
  );
};
