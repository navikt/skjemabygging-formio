import { attachmentUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Alert from '../../components/alert/Alert';
import PostalSubmissionInstructions from '../../components/postal-submission-instructions/PostalSubmissionInstructions';
import { useFormDefinitionForm, useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidationActions } from '../../context/validation/ValidationContext';
import { SUMMARY_KEY } from '../../form-flow/constants';
import { focusPageTitleAfterNavigation } from '../../form-flow/focusPageTitleAfterNavigation';
import { FormButtonRow, FormPrevButton } from '../../form-flow/layout/FormButtonRow';
import FormHeader from '../../form-flow/layout/FormHeader';
import { useSendinnPageSetup } from '../journey/useSendinnPageSetup';
import { useSendinnStepNavigation } from '../journey/useSendinnStepNavigation';
import CoverPageDownloadSection from './CoverPageDownloadSection';

const SendinnPaperSubmissionPage = () => {
  const { translate } = useLanguage();
  const { search } = useLocation();
  const navigate = useNavigate();
  const form = useFormDefinitionForm();
  const panels = useFormDefinitionPanels();
  const { validatePages } = useValidationActions();
  const goToStep = useSendinnStepNavigation();
  const { submission } = useSubmissionState();
  const { formTitle, hasAttachments } = useSendinnPageSetup();
  const pageKeys = useMemo(() => panels.map((panel) => panel.key), [panels]);
  const checkedOnEntry = useRef(false);
  const selectedAttachments = useMemo(
    () =>
      submission
        ? attachmentUtils.getSelectedAttachmentsForCoverPage(submission, form).flatMap(({ component, attachments }) =>
            attachments.map((attachment) => ({
              key: attachment.attachmentId,
              content: attachment.title || translate(component.label),
            })),
          )
        : [],
    [form, submission, translate],
  );

  // Answers live only in memory, so a direct visit or a reload sends the user back to the summary's error list.
  const isValid = useCallback(() => {
    if (validatePages(pageKeys).length === 0) return true;
    navigate({ pathname: `/${form.path}/${SUMMARY_KEY}`, search }, { replace: true, state: { redirect: true } });
    return false;
  }, [form.path, navigate, pageKeys, search, validatePages]);

  useEffect(() => {
    if (checkedOnEntry.current || !hasAttachments) return;
    checkedOnEntry.current = true;
    if (isValid()) return focusPageTitleAfterNavigation();
  }, [hasAttachments, isValid]);

  return (
    <div data-journey="form">
      <FormHeader form={form} formTitle={formTitle} pageTitle={TEXTS.statiske.sendinn.coverPage.notSent} />
      {hasAttachments ? (
        <>
          <PostalSubmissionInstructions
            introduction={translate(TEXTS.statiske.prepareLetterPage.firstDescription)}
            download={{
              title: translate(TEXTS.statiske.sendinn.coverPage.download),
              content: <CoverPageDownloadSection isValid={isValid} />,
            }}
            print={{
              title: translate(TEXTS.statiske.sendinn.coverPage.print),
              description: translate(TEXTS.statiske.staticPdf.instructions.step2),
            }}
            attachments={selectedAttachments}
            mailingDescription={translate(TEXTS.statiske.staticPdf.instructions.step4)}
          />
          <FormButtonRow
            previousButton={
              <FormPrevButton
                label={translate(TEXTS.grensesnitt.navigation.previous)}
                onClick={() => goToStep(SUMMARY_KEY)}
              />
            }
          />
        </>
      ) : (
        <Alert variant="info">{translate(TEXTS.statiske.sendinn.noMatchingDocuments)}</Alert>
      )}
    </div>
  );
};

export default SendinnPaperSubmissionPage;
