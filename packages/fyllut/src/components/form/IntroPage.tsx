import { Accordion, GuidePanel, Heading } from '@navikt/ds-react';
import { Intro, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormNextButton,
  useFormDefinition,
  useFormPersistence,
  useSubmissionState,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useRef, useState } from 'react';
import FormSecondaryButtons from './FormSecondaryButtons';
import { useNologinToken } from './nologin-token/NologinTokenContext';

interface Props {
  onStart: () => void;
}

const IntroPage = ({ onStart }: Props) => {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const { form } = useFormDefinition();
  const { saveDraft, canSaveDraft, status } = useFormPersistence();
  const { submission, setSubmission } = useSubmissionState();
  const [selfDeclarationError, setSelfDeclarationError] = useState<string | undefined>();
  const { tokenExpiration, getNologinToken } = useNologinToken();
  const hasInitializedDraft = useRef(false);

  const introPage = form.introPage;
  const isDynamic = introPage?.enabled;

  const setSelfDeclaration = (value: boolean) => {
    setSubmission((prev) => ({ ...(prev ?? { data: {} }), selfDeclaration: value }));
    if (value) setSelfDeclarationError(undefined);
  };

  useEffect(() => {
    if (submissionMethod === 'digital') {
      setSubmission((prev) => prev ?? { data: {} });
    }
  }, [setSubmission, submissionMethod]);

  useEffect(() => {
    if (submissionMethod === 'digitalnologin' && !tokenExpiration) {
      void getNologinToken();
    }
  }, [getNologinToken, submissionMethod, tokenExpiration]);

  useEffect(() => {
    if (
      hasInitializedDraft.current ||
      submissionMethod !== 'digital' ||
      !canSaveDraft ||
      !submission ||
      new URLSearchParams(window.location.search).has('innsendingsId')
    ) {
      return;
    }

    hasInitializedDraft.current = true;
    void saveDraft();
  }, [canSaveDraft, saveDraft, submission, submissionMethod]);

  const handleStart = async () => {
    if (isDynamic && !submission?.selfDeclaration) {
      setSelfDeclarationError(translate('introPage.selfDeclaration.validationError'));
      return;
    }

    if (canSaveDraft) {
      await saveDraft();
    }

    onStart();
  };

  return (
    <>
      {isDynamic ? (
        <>
          <Intro.GuidePanel description={introPage.introduction} translate={translate} className="mb" />
          <Intro.ImportantInformation
            title={introPage.importantInformation?.title}
            description={introPage.importantInformation?.description}
            translate={translate}
            className="mb"
          />
          <Intro.Scope properties={introPage.sections?.scope} translate={translate} className="mb" />
          <Intro.OutOfScope properties={introPage.sections?.outOfScope} translate={translate} className="mb" />
          <Intro.Prerequisites properties={introPage.sections?.prerequisites} translate={translate} className="mb" />
          <Intro.BeAwareOf
            translate={translate}
            submissionMethod={submissionMethod}
            tokenExp={tokenExpiration}
            className="mb"
          />
          <Accordion className="mb">
            <Intro.DataDisclosure properties={introPage.sections?.dataDisclosure} translate={translate} />
            {submissionMethod === 'digital' && <Intro.DataStorage translate={translate} />}
            <Intro.AutomaticProcessing properties={introPage.sections?.automaticProcessing} translate={translate} />
            <Intro.Optional properties={introPage.sections?.optional} translate={translate} />
          </Accordion>
          <Intro.SelfDeclaration
            description={introPage.selfDeclaration}
            translate={translate}
            className="mb"
            error={selfDeclarationError}
            setSelfDeclaration={setSelfDeclaration}
            value={submission?.selfDeclaration}
          />
        </>
      ) : (
        <GuidePanel poster>
          <Heading level="2" size="small" spacing>
            {translate(TEXTS.statiske.introPage.title)}
          </Heading>
          <ul>
            {submissionMethod === 'paper' && (
              <li>
                <b>{translate(TEXTS.statiske.introPage.paperDescriptionBold)} </b>
                {translate(TEXTS.statiske.introPage.paperDescription)}
              </li>
            )}
            {submissionMethod === 'digitalnologin' && (
              <li>
                <b>
                  {translate(TEXTS.statiske.introPage.nologinTimeLimitBold, {
                    tokenExpirationTime: tokenExpiration
                      ? dateUtils.formatUnixEpochSecondsToLocalTime(tokenExpiration)
                      : 'XX.XX',
                  })}{' '}
                </b>
                {translate(TEXTS.statiske.introPage.nologinTimeLimit)}
              </li>
            )}
            <li>
              <b>{translate(TEXTS.statiske.introPage.requiredFieldsBold)} </b>
              {translate(TEXTS.statiske.introPage.requiredFields)}
            </li>
            <li>
              <b>
                {translate(
                  submissionMethod === 'digital'
                    ? TEXTS.statiske.introPage.autoSaveBold
                    : TEXTS.statiske.introPage.notSaveBold,
                )}{' '}
              </b>
              {translate(
                submissionMethod === 'digital' ? TEXTS.statiske.introPage.autoSave : TEXTS.statiske.introPage.notSave,
              )}
            </li>
            <li>
              <b>{translate(TEXTS.statiske.introPage.publicComputerBold)} </b>
              {translate(TEXTS.statiske.introPage.publicComputer)}
            </li>
          </ul>
        </GuidePanel>
      )}
      <FormSecondaryButtons introUploadIdLink />

      <FormButtonRow
        nextButton={
          <FormNextButton
            label={translate(
              submissionMethod === 'digital'
                ? TEXTS.grensesnitt.navigation.saveAndContinue
                : TEXTS.grensesnitt.navigation.next,
            )}
            loading={status === 'saving'}
            onClick={handleStart}
          />
        }
      />
    </>
  );
};

export default IntroPage;
