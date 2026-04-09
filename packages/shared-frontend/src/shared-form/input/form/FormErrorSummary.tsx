import { ErrorSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { SharedFormInputError, SharedFormTranslate } from '../types';

interface FormErrorSummaryProps {
  errors: SharedFormInputError[];
  translate: SharedFormTranslate;
}

const FormErrorSummary = ({ errors, translate }: FormErrorSummaryProps) => {
  if (!errors.length) {
    return null;
  }

  return (
    <ErrorSummary heading={translate(TEXTS.validering.error)} data-cy="error-summary">
      {errors.map(({ ref, submissionPath, message }, i) => (
        <ErrorSummary.Item
          href="#"
          onClick={(event) => {
            event.preventDefault();
            if (ref?.current) {
              ref.current.focus();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
              if (ref?.current) {
                ref.current.focus();
              }
            }
          }}
          key={`${submissionPath}-${i}`}
        >
          {message}
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  );
};

export default FormErrorSummary;
export type { FormErrorSummaryProps };
