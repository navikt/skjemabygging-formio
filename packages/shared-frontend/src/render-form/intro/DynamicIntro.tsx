import { Accordion, Alert, Checkbox, CheckboxGroup, GuidePanel, Heading, VStack } from '@navikt/ds-react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import BeAwareOf from './BeAwareOf';
import IntroAccordion from './IntroAccordion';
import IntroSection from './IntroSection';
import RichText from './RichText';

const DynamicIntro = ({
  tokenExpiration,
  selfDeclarationError,
  setSelfDeclaration,
}: {
  tokenExpiration?: number;
  selfDeclarationError?: string;
  setSelfDeclaration: (value: boolean) => void;
}) => {
  const { form } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const introPage = form.introPage;

  return (
    <VStack gap="space-32">
      {introPage?.introduction && (
        <GuidePanel poster>
          <Heading level="2" size="small" spacing>
            {translate('introPage.guidePanel.hi')}
          </Heading>
          <RichText content={translate(introPage.introduction)} />
        </GuidePanel>
      )}
      {introPage?.importantInformation?.description && (
        <Alert variant="info">
          {introPage.importantInformation.title && (
            <Heading level="2" size="small" spacing>
              {translate(introPage.importantInformation.title)}
            </Heading>
          )}
          <RichText content={translate(introPage.importantInformation.description)} />
        </Alert>
      )}
      <IntroSection section={introPage?.sections?.scope} />
      <IntroSection section={introPage?.sections?.outOfScope} level="3" />
      <IntroSection section={introPage?.sections?.prerequisites} />
      <BeAwareOf submissionMethod={submissionMethod} tokenExpiration={tokenExpiration} />
      <Accordion>
        {introPage?.sections?.dataDisclosure?.title && (
          <IntroAccordion
            title={translate(introPage.sections.dataDisclosure.title)}
            description={translate('introPage.dataDisclosure.ingress')}
            bulletPoints={[
              translate('introPage.dataDisclosure.nationalPopulationRegister'),
              ...(introPage.sections.dataDisclosure.bulletPoints ?? []).map((bulletPoint) => translate(bulletPoint)),
            ]}
            contentBottom={<RichText content={translate('introPage.dataTreatment.readMore')} />}
          />
        )}
        {submissionMethod === 'digital' && (
          <IntroAccordion
            title={translate('introPage.dataStorage.title.digital')}
            description={translate('introPage.dataStorage.ingress.digital')}
          />
        )}
        {introPage?.sections?.automaticProcessing && (
          <IntroAccordion
            title={translate('introPage.automaticProcessing.title')}
            description={translate(introPage.sections.automaticProcessing.description)}
            bulletPoints={introPage.sections.automaticProcessing.bulletPoints?.map((bulletPoint) =>
              translate(bulletPoint),
            )}
          />
        )}
        {introPage?.sections?.optional?.title && (
          <IntroAccordion
            title={translate(introPage.sections.optional.title)}
            description={translate(introPage.sections.optional.description)}
            bulletPoints={introPage.sections.optional.bulletPoints?.map((bulletPoint) => translate(bulletPoint))}
          />
        )}
      </Accordion>
      {introPage?.selfDeclaration && (
        <section>
          <RichText content={translate(introPage.selfDeclaration)} />
          <CheckboxGroup
            legend={translate('introPage.selfDeclaration.inputLabel')}
            hideLegend
            error={selfDeclarationError}
          >
            <Checkbox
              value="selfDeclaration"
              checked={!!submission?.selfDeclaration}
              error={!!selfDeclarationError}
              onChange={(event) => setSelfDeclaration(event.target.checked)}
            >
              {translate('introPage.selfDeclaration.inputLabel')}
            </Checkbox>
          </CheckboxGroup>
        </section>
      )}
    </VStack>
  );
};

export default DynamicIntro;
