import { ArrowUndoIcon } from '@navikt/aksel-icons';
import { Button, LinkCard, VStack } from '@navikt/ds-react';
import { TEXTS, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useFormDefinition } from '../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../context/language/LanguageContext';
import type { SharedFormRendererProps } from './types';

const SubmissionMethodSelection = ({ host }: { host: SharedFormRendererProps['host'] }) => {
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const [showNoLogin, setShowNoLogin] = useState(false);
  const methods = form.properties.submissionTypes;

  useEffect(() => {
    if (submissionTypesUtils.isPaperSubmissionOnly(methods)) {
      host.onSelectSubmissionMethod?.('paper');
    } else if (submissionTypesUtils.isDigitalSubmissionOnly(methods)) {
      host.onSelectSubmissionMethod?.('digital');
    } else if (submissionTypesUtils.isDigitalNoLoginSubmissionOnly(methods)) {
      host.onSelectSubmissionMethod?.('digitalnologin');
    } else if (submissionTypesUtils.isPaperNoCoverPageSubmissionOnly(methods)) {
      host.onSelectSubmissionMethod?.('papernocoverpage');
    }
  }, [host, methods]);

  const hasDigital = submissionTypesUtils.isDigitalSubmission(methods);
  const hasPaper = submissionTypesUtils.isPaperSubmission(methods);
  const hasNoLogin = submissionTypesUtils.isDigitalNoLoginSubmission(methods);

  return (
    <VStack gap="space-4">
      {!showNoLogin && hasDigital && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href="#"
              onClick={(event) => {
                event.preventDefault();
                host.onSelectSubmissionMethod?.('digital');
              }}
            >
              {translate(
                host.isLoggedIn
                  ? TEXTS.grensesnitt.introPage.sendDigitalLoggedIn
                  : TEXTS.grensesnitt.introPage.sendDigital,
              )}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{translate(TEXTS.grensesnitt.introPage.sendDigitalDescription)}</LinkCard.Description>
        </LinkCard>
      )}
      {!showNoLogin && hasDigital && hasPaper && hasNoLogin && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setShowNoLogin(true);
              }}
            >
              {translate(TEXTS.grensesnitt.introPage.noLogin)}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{translate(TEXTS.grensesnitt.introPage.noLoginDescription)}</LinkCard.Description>
        </LinkCard>
      )}
      {hasNoLogin && (showNoLogin || !hasDigital || !hasPaper) && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href="#"
              onClick={(event) => {
                event.preventDefault();
                host.onSelectSubmissionMethod?.('digitalnologin');
              }}
            >
              {translate(TEXTS.grensesnitt.introPage.sendDigitalNoLogin)}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            {translate(TEXTS.grensesnitt.introPage.sendDigitalNoLoginDescription)}
          </LinkCard.Description>
        </LinkCard>
      )}
      {hasPaper && (showNoLogin || !hasDigital || !hasNoLogin) && (
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor
              href="#"
              onClick={(event) => {
                event.preventDefault();
                host.onSelectSubmissionMethod?.('paper');
              }}
            >
              {translate(TEXTS.grensesnitt.introPage.sendOnPaper)}
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>{translate(TEXTS.grensesnitt.introPage.sendOnPaperDescription)}</LinkCard.Description>
        </LinkCard>
      )}
      {showNoLogin && (
        <Button variant="tertiary" icon={<ArrowUndoIcon aria-hidden />} onClick={() => setShowNoLogin(false)}>
          {translate(TEXTS.grensesnitt.introPage.changeSubmissionMethod)}
        </Button>
      )}
    </VStack>
  );
};

export default SubmissionMethodSelection;
