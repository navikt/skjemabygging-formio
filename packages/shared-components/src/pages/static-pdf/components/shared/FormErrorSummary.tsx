import { ErrorSummary } from '@navikt/ds-react';
import { useValidator } from '../../../../context/validator/ValidatorContext';

const FormErrorSummary = () => {
  const { errors } = useValidator();

  if (!errors.length) {
    return null;
  }

  return (
    <ErrorSummary heading="feilmeldinger" data-cy="error-summary">
      {errors.map(({ ref, message }, i) => (
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
          key={i}
        >
          {message}
        </ErrorSummary.Item>
      ))}
    </ErrorSummary>
  );
};

export default FormErrorSummary;
