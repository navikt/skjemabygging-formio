import { Alert, Box } from '@navikt/ds-react';

const InactiveTranslationWarning = () => {
  return (
    <Box marginBlock="space-8 space-0">
      <Alert variant="warning" size="small" data-testid="inactive-translation-warning">
        Teksten har en oversettelse som vil bli inaktiv med denne endringen. Vurder å endre under oversettelser.
      </Alert>
    </Box>
  );
};

export default InactiveTranslationWarning;
