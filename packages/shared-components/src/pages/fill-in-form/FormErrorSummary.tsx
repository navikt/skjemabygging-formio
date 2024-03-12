import { ErrorSummary } from '@navikt/ds-react';
import { ComponentError } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef } from 'react';
import { KeyOrFocusComponentId } from '../../formio/overrides/wizard-overrides.js/focusOnComponent';

interface FormErrorSummaryProps {
  heading: string;
  errors: ComponentError[];
  focusOnComponent: (componentId: KeyOrFocusComponentId) => void;
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
            onClick={() => focusOnComponent({ path: error.path, metadataId: error.metadataId })}
            onKeyUp={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.stopPropagation();
                focusOnComponent({ path: error.path, metadataId: error.metadataId });
              }
            }}
            key={`${error.path}${error.metadataId && `-${error.metadataId}`}`}
          >
            {error.message}
          </ErrorSummary.Item>
        ))}
      </ErrorSummary>
    );
  },
);

export default FormErrorSummary;
