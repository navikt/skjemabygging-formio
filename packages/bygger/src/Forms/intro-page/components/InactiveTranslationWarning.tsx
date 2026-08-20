import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Alert, Box, Link } from '@navikt/ds-react';
import { Link as ReactRouterLink } from 'react-router';
import { useForm } from '../../../context/old_form/FormContext';

const InactiveTranslationWarning = () => {
  const { formState } = useForm();
  const formPath = formState.form?.path;

  return (
    <Box marginBlock="space-8 space-0">
      <Alert variant="warning" size="small" data-testid="inactive-translation-warning">
        Teksten har en oversettelse som vil bli inaktiv med denne endringen. Vurder å endre under{' '}
        {formPath ? (
          <Link as={ReactRouterLink} to={`/forms/${formPath}/oversettelser`} target="_blank" rel="noreferrer">
            oversettelser <ExternalLinkIcon aria-hidden fontSize="1em" />
            <span className="sr-only"> (åpnes i ny fane)</span>
          </Link>
        ) : (
          'oversettelser'
        )}
        .
      </Alert>
    </Box>
  );
};

export default InactiveTranslationWarning;
