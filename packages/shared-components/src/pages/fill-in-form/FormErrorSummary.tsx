import { ErrorSummary } from '@navikt/ds-react';
import { forwardRef } from 'react';

interface FormErrorSummaryProps {
  heading: string;
  errors: any[];
  focusOnComponent: Function;
}

const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  ({ heading, errors, focusOnComponent }, ref) => {
    if (!errors.length) {
      return <></>;
    }
    return (
      <ErrorSummary heading={heading} ref={ref}>
        {errors.map((error) => (
          <ErrorSummary.Item
            tabIndex={0}
            onClick={() => focusOnComponent(error.formattedKeyOrPath)}
            onKeyUp={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.stopPropagation();
                focusOnComponent(error.formattedKeyOrPath);
              }
            }}
            key={error.formattedKeyOrPath}
          >
            {error.message}
          </ErrorSummary.Item>
        ))}
      </ErrorSummary>
    );
  },
);

export default FormErrorSummary;
