import { Accordion, GuidePanel, Heading } from '@navikt/ds-react';
import { Intro, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormNextButton,
  useFormDefinition,
  useSubmission,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useState } from 'react';

interface Props {
  onStart: () => void;
}

const IntroPage = ({ onStart }: Props) => {
  const { translate } = useLanguages();
  const { submissionMethod } = useAppConfig();
  const { form } = useFormDefinition();
  const { submission, setSubmission } = useSubmission();
  const [selfDeclarationError, setSelfDeclarationError] = useState<string | undefined>();

  const introPage = form.introPage;
  const isDynamic = introPage?.enabled;

  const setSelfDeclaration = (value: boolean) => {
    setSubmission((prev) => ({ ...(prev ?? { data: {} }), selfDeclaration: value }));
    if (value) setSelfDeclarationError(undefined);
  };

  const handleStart = () => {
    if (isDynamic && !submission?.selfDeclaration) {
      setSelfDeclarationError(translate('introPage.selfDeclaration.validationError'));
      return;
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
          <Intro.BeAwareOf translate={translate} submissionMethod={submissionMethod} className="mb" />
          <Accordion className="mb">
            <Intro.DataDisclosure properties={introPage.sections?.dataDisclosure} translate={translate} />
            <Intro.DataStorage translate={translate} />
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

      <FormButtonRow
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={handleStart} />}
      />
    </>
  );
};

export default IntroPage;
