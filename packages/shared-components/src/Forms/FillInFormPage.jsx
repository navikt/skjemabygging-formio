import { navFormUtils, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { useSendInn } from "../context/sendInn/sendInnContext";
import { LoadingComponent } from "../index";
import { scrollToAndSetFocus } from "../util/focus-management.js";
import { getPanelSlug } from "../util/form";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const navigate = useNavigate();
  const {
    loggSkjemaApnet,
    loggSkjemaSporsmalBesvart,
    loggSkjemaSporsmalBesvartForSpesialTyper,
    loggSkjemaStegFullfort,
    loggSkjemaValideringFeilet,
    loggNavigering,
  } = useAmplitude();
  const { featureToggles, submissionMethod } = useAppConfig();
  const [formForRendering, setFormForRendering] = useState();
  const { startMellomlagring, updateMellomlagring, isMellomlagringReady } = useSendInn();
  const { currentLanguage, translationsForNavForm, translate } = useLanguages();
  const { panelSlug } = useParams();
  const { search } = useLocation();

  useEffect(() => {
    setFormForRendering(submissionMethod === "digital" ? navFormUtils.removeVedleggspanel(form) : form);
  }, [form, submissionMethod]);

  useEffect(() => {
    loggSkjemaApnet(submissionMethod);
  }, [loggSkjemaApnet, submissionMethod]);

  useEffect(() => {
    if (featureToggles.enableMellomlagring && submissionMethod === "digital") {
      startMellomlagring(submission);
    }
  }, [submission, startMellomlagring, featureToggles.enableMellomlagring, submissionMethod]);

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  if (featureToggles.enableMellomlagring && submissionMethod === "digital" && !isMellomlagringReady) {
    return <LoadingComponent heightOffsetRem={18} />;
  }

  function updatePanelUrl(panelPath) {
    navigate({ pathname: `${formUrl}/${panelPath}`, search });
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

  function onNextPage({ page, currentPanels, submission }) {
    updateMellomlagring(submission);
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.next),
      destinasjon: `${formUrl}/${currentPanels?.[page]}`,
    });
    loggSkjemaStegFullfort({ steg: page, skjemastegNokkel: currentPanels?.[page - 1] || "" });
    onNextOrPreviousPage(page, currentPanels);
  }

  function onPreviousPage({ page, currentPanels }) {
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.previous),
      destinasjon: `${formUrl}/${currentPanels?.[page - 2]}`,
    });
    onNextOrPreviousPage(page, currentPanels);
  }

  function onCancel({ url }) {
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancel),
      destinasjon: url,
    });
  }

  function onNextOrPreviousPage(page, currentPanels) {
    if (page <= currentPanels.length - 1) {
      updatePanelUrl(currentPanels[page]);
    }
    scrollToAndSetFocus("#maincontent", "start");
  }

  function onWizardPageSelected(panel) {
    loggNavigering({ lenkeTekst: translate(panel.component.title), destinasjon: `${formUrl}/${panel.path}` });
    updatePanelUrl(panel.path);
  }

  function onFormReady(formioInstance) {
    goToPanelFromUrlParam(formioInstance);
  }

  const onSubmit = (submission) => {
    updateMellomlagring(submission);
    setSubmission(submission);
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.submit),
      destinasjon: `${formUrl}/oppsummering`,
    });
    loggSkjemaStegFullfort({
      steg: form.components.findIndex((panel) => panel.key === panelSlug) + 1,
      panelSlug,
    });
    navigate({ pathname: `${formUrl}/oppsummering`, search });
  };

  const onError = () => {
    loggSkjemaValideringFeilet();
  };

  return (
    <div>
      {formForRendering && (
        <NavForm
          form={formForRendering}
          language={featureToggles.enableTranslations ? currentLanguage : undefined}
          i18n={featureToggles.enableTranslations ? translationsForNavForm : undefined}
          submission={submission}
          onBlur={loggSkjemaSporsmalBesvart}
          onChange={loggSkjemaSporsmalBesvartForSpesialTyper}
          onError={onError}
          onSubmit={onSubmit}
          onNextPage={onNextPage}
          onPrevPage={onPreviousPage}
          onCancel={onCancel}
          formReady={onFormReady}
          submissionReady={goToPanelFromUrlParam}
          onWizardPageSelected={onWizardPageSelected}
          className="nav-form"
        />
      )}
    </div>
  );
};
