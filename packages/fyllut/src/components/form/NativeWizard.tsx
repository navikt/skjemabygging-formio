import { Button, HStack, Heading, VStack } from '@navikt/ds-react';
import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { FormErrorSummary, RenderInputForm, useWizardController } from '@navikt/skjemadigitalisering-shared-frontend';
import { useState } from 'react';
import NativeSummary from './NativeSummary';

interface Props {
  title: string;
}

const NativeWizard = ({ title }: Props) => {
  const { translate } = useLanguages();
  const { currentPanel, components, isFirst, isLast, goToNext, goToPrevious } = useWizardController();
  const [showSummary, setShowSummary] = useState(false);

  if (showSummary) {
    return <NativeSummary onBack={() => setShowSummary(false)} />;
  }

  const handleNext = () => {
    const valid = goToNext();
    if (valid && isLast) {
      setShowSummary(true);
    }
  };

  return (
    <VStack gap="space-24" aria-live="polite">
      <Heading size="large">{title}</Heading>
      <Heading size="medium">{translate(currentPanel?.title ?? '')}</Heading>
      <RenderInputForm components={components} />
      <FormErrorSummary />
      <HStack gap="space-16">
        {!isFirst && (
          <Button type="button" variant="secondary" onClick={goToPrevious}>
            {translate('Forrige')}
          </Button>
        )}
        <Button type="button" onClick={handleNext}>
          {isLast ? translate('Til oppsummering') : translate('Neste')}
        </Button>
      </HStack>
    </VStack>
  );
};

export default NativeWizard;
