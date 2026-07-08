import { ErrorSummary } from '@navikt/ds-react';
import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { FieldError, useValidation } from '../../context/validation/ValidationContext';
import { inputId } from '../../form-components/input/inputId';

interface Props {
  pageKey?: string;
  components?: Component[];
  pages?: { pageKey: string; components: Component[] }[];
  onNavigateToField?: (error: FieldError, id: string) => void;
}

/**
 * Shown only after a next/submit/instructions trigger sets it visible. Sits above the bottom
 * navigation; focuses itself when it appears. Clears when errors are fixed or page left.
 */
const FormErrorSummary = ({ pageKey, components, pages, onNavigateToField }: Props) => {
  const { getErrorsForPage, getErrorsForPages, shouldShowSummaryForPage, shouldShowSummaryForSummaryPage } =
    useValidation();
  const { translate } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const errors = pages ? getErrorsForPages(pages) : pageKey && components ? getErrorsForPage(pageKey, components) : [];

  const visible = pages
    ? shouldShowSummaryForSummaryPage() && errors.length > 0
    : !!pageKey && shouldShowSummaryForPage(pageKey) && errors.length > 0;

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
  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>, error: FieldError, id: string) => {
    const element = document.getElementById(id);
    if (!element && onNavigateToField) {
      event.preventDefault();
      event.stopPropagation();
      onNavigateToField?.(error, id);
      return;
    }
    if (!element) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
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
      {errors.map((error) => {
        const { submissionPath, message } = error;
        const id = inputId(submissionPath);
        return (
          <ErrorSummary.Item
            key={submissionPath}
            href={`#${id}`}
            onClick={(event) => handleItemClick(event, error, id)}
          >
            {message}
          </ErrorSummary.Item>
        );
      })}
    </ErrorSummary>
  );
};

FormErrorSummary.displayName = 'FormErrorSummary';

export default FormErrorSummary;
