import { ErrorSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useValidation } from '../../context/validation/ValidationContext';
import { inputId } from '../../form-components/input/inputId';

/**
 * Shown only after a next/submit/instructions trigger sets it visible. Sits above the bottom
 * navigation; focuses itself when it appears. Clears when errors are fixed or page left.
 */
const FormErrorSummary = () => {
  const { errors, summaryVisible } = useValidation();
  const { translate } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const visible = summaryVisible && errors.length > 0;

  useEffect(() => {
    if (visible) {
      ref.current?.focus();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  // Focus the field directly instead of letting the anchor's hash navigation run, which under
  // the app router would change the URL (e.g. to /fyllut#input-firstName) and leave the page.
  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ block: 'center' });
    // Fieldset-based groups (radio/checkbox) aren't focusable; focus the first control inside.
    const focusTarget =
      element.matches('input, select, textarea, button, [tabindex]') || element.tabIndex >= 0
        ? element
        : element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]');
    focusTarget?.focus({ preventScroll: true });
  };

  return (
    <ErrorSummary ref={ref} heading={translate(TEXTS.validering.error)} data-cy="error-summary">
      {errors.map(({ submissionPath, message }) => {
        const id = inputId(submissionPath);
        return (
          <ErrorSummary.Item key={submissionPath} href={`#${id}`} onClick={(event) => handleItemClick(event, id)}>
            {message}
          </ErrorSummary.Item>
        );
      })}
    </ErrorSummary>
  );
};

FormErrorSummary.displayName = 'FormErrorSummary';

export default FormErrorSummary;
