import { NavFormType, Submission, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { hasRelevantAttachments } from '../../util/attachment/attachmentsUtil';
import { PanelValidation } from '../../util/form/panel-validation/panelValidation';
import { NextButton } from './NextButton';

type Props = {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  setError: Dispatch<SetStateAction<Error | undefined>>;
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
};

export function SummaryPageNextButton({
  form,
  submission,
  panelValidationList,
  setError,
  isValid,
  setSubmitError,
}: Props) {
  const { app, submissionMethod, logEvent } = useAppConfig();
  const canSubmit =
    !panelValidationList || panelValidationList.every((panelValidation) => !panelValidation.hasValidationErrors);
  const navigate = useNavigate();
  const { search } = useLocation();
  const { translate, currentLanguage } = useLanguages();
  const { submitSoknad } = useSendInn();
  const [loading, setLoading] = useState(false);
  const submissionTypes = form?.properties.submissionTypes;
  const digitalWithoutAttachments =
    (submissionMethod === 'digital' || submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) &&
    !hasRelevantAttachments(form, submission ?? { data: {} });

  const submit = async (e) => {
    if (!canSubmit || !submission || !submission.data) {
      if (setSubmitError) {
        setSubmitError(translate(TEXTS.grensesnitt.navigation.summaryPageError));
      }
      return;
    }

    if (isValid && !isValid(e)) {
      return;
    }

    if (
      submissionMethod === 'paper' ||
      app === 'bygger' ||
      submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)
    ) {
      navigate({ pathname: '../send-i-posten', search });
      return;
    }

    if (submissionTypesUtils.isNoneSubmission(submissionTypes)) {
      navigate({ pathname: '../ingen-innsending', search });
      return;
    }

    try {
      setLoading(true);
      await submitSoknad(submission);
      logEvent?.({
        name: 'skjema fullført',
        data: {
          skjemaId: form.properties.skjemanummer,
          skjemanavn: form.title,
          tema: form.properties.tema,
          language: currentLanguage,
          submissionMethod,
        },
      });
    } catch (err: any) {
      logEvent?.({
        name: 'skjemainnsending feilet',
        data: {
          skjemaId: form.properties.skjemanummer,
          skjemanavn: form.title,
          tema: form.properties.tema,
          language: currentLanguage,
          submissionMethod,
        },
      });
      setError(err);
      setLoading(false);
    }
  };

  return (
    <NextButton
      label={{
        digital: digitalWithoutAttachments
          ? translate(TEXTS.grensesnitt.navigation.sendToNav)
          : translate(TEXTS.grensesnitt.navigation.saveAndContinue),
        digitalnologin: translate(TEXTS.grensesnitt.navigation.sendToNav),
        default: translate(TEXTS.grensesnitt.navigation.instructions),
      }}
      onClick={{
        default: submit,
      }}
      variant={canSubmit ? 'primary' : 'secondary'}
      hideIcon={submissionMethod === 'digitalnologin' || digitalWithoutAttachments}
      loading={loading}
    />
  );
}
