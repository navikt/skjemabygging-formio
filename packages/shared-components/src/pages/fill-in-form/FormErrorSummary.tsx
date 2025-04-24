import { ErrorSummary } from '@navikt/ds-react';
import { ComponentError } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef } from 'react';
import { KeyOrFocusComponentId } from '../../formio/overrides/wizard-overrides.js/focusOnComponent';

interface FormErrorSummaryProps {
  heading: string;
  errors: ComponentError[];
  focusOnComponent: (componentId: KeyOrFocusComponentId) => void;
}

const SPACE = ' ';

const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  ({ heading, errors, focusOnComponent }, ref) => {
    if (!errors.length) {
      return <></>;
    }
    return (
      <ErrorSummary heading={heading} ref={ref} data-cy="error-summary">
        {errors.map((error) => (
          <ErrorSummary.Item
            href="#"
            onClick={(event) => {
              event.preventDefault();
              focusOnComponent({ path: error.path, elementId: error.elementId });
            }}
            onKeyUp={(event) => {
              if (event.key === 'Enter' || event.key === SPACE) {
                event.stopPropagation();
                focusOnComponent({ path: error.path, elementId: error.elementId });
              }
            }}
            key={`${error.path}${error.elementId ? `-${error.elementId}` : ''}`}
          >
            {error.message}
          </ErrorSummary.Item>
        ))}
      </ErrorSummary>
    );
  },
);

export default FormErrorSummary;
