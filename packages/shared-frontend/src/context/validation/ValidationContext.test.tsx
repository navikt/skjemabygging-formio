import { SubmissionData, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act, ReactNode, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValidationRules } from '../../validation/validators';
import { ApplicationProvider } from '../application/ApplicationContext';
import { LanguageProvider } from '../language/LanguageContext';
import { SubmissionStateProvider } from '../state/SubmissionStateContext';
import { useStateField } from '../state/useStateField';
import { attachmentValidationPath, useValidation, ValidationProvider } from './ValidationContext';
import ValidationRegistration from './ValidationRegistration';
import { ValidationScopeProvider } from './ValidationScopeContext';

const translations = Object.fromEntries(
  Object.entries(TEXTS.validering).flatMap(([key, value]) => [
    [key, { nb: value, en: `EN:${value}` }],
    [value, { nb: value, en: `EN:${value}` }],
  ]),
);

interface FieldProps {
  statePath: string;
  label: string;
  rules: ValidationRules;
}

const Field = ({ statePath, label, rules }: FieldProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath, validation: { field: label, rules } });

  return (
    <>
      <input
        aria-label={statePath}
        value={typeof stateValue === 'string' ? stateValue : ''}
        onChange={(event) => setStateValue(event.target.value)}
      />
      <span data-testid={`error-${statePath}`}>{error ?? ''}</span>
    </>
  );
};

const renderApp = (
  root: Root,
  children: ReactNode,
  currentLanguage: 'nb' | 'en' = 'nb',
  initialData: SubmissionData = {},
) => {
  act(() => {
    root.render(
      <ApplicationProvider environment="test">
        <LanguageProvider
          translations={translations}
          currentLanguage={currentLanguage}
          availableLanguages={['nb', 'en']}
        >
          <SubmissionStateProvider initialSubmission={{ data: initialData }}>
            <ValidationProvider>{children}</ValidationProvider>
          </SubmissionStateProvider>
        </LanguageProvider>
      </ApplicationProvider>,
    );
  });
};

const click = (container: HTMLElement, name: string) => {
  const button = [...container.querySelectorAll('button')].find((element) => element.textContent === name);
  act(() => {
    (button as HTMLButtonElement).click();
  });
};

const type = (container: HTMLElement, statePath: string, value: string) => {
  const input = container.querySelector<HTMLInputElement>(`input[aria-label="${statePath}"]`) as HTMLInputElement;
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  act(() => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const textOf = (container: HTMLElement, testId: string) =>
  container.querySelector(`[data-testid="${testId}"]`)?.textContent;

describe('ValidationContext', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('validates the fields registered by the rendered components', () => {
    const Harness = () => {
      const { validatePages } = useValidation();
      const [failedPageKeys, setFailedPageKeys] = useState<string[]>([]);

      return (
        <>
          <button type="button" onClick={() => setFailedPageKeys(validatePages(['page1']))}>
            Validate
          </button>
          <span data-testid="failed-pages">{JSON.stringify(failedPageKeys)}</span>
          <ValidationScopeProvider pageKey="page1">
            <Field statePath="firstName" label="First name" rules={{ required: true }} />
            <Field
              statePath="identityNumber"
              label="National identity number"
              rules={{ nationalIdentityNumber: true }}
            />
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />, 'nb', { identityNumber: '123' });
    click(container, 'Validate');

    expect(textOf(container, 'failed-pages')).toBe('["page1"]');
    expect(textOf(container, 'error-firstName')).toBe('Du må fylle ut: First name');
    expect(textOf(container, 'error-identityNumber')).toBe(TEXTS.validering.fodselsnummerDNummer);
  });

  it('validates the value the user just entered', () => {
    const Harness = () => {
      const { validatePage } = useValidation();

      return (
        <>
          <button type="button" onClick={() => validatePage('page1')}>
            Next
          </button>
          <ValidationScopeProvider pageKey="page1">
            <Field statePath="firstName" label="First name" rules={{ required: true }} />
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />);
    click(container, 'Next');
    expect(textOf(container, 'error-firstName')).toBe('Du må fylle ut: First name');

    type(container, 'firstName', 'Ada');
    click(container, 'Next');
    expect(textOf(container, 'error-firstName')).toBe('');
  });

  it('recomputes cached errors in the new language', () => {
    const Harness = () => {
      const { validatePages } = useValidation();

      return (
        <>
          <button type="button" onClick={() => validatePages(['page1'])}>
            Validate
          </button>
          <ValidationScopeProvider pageKey="page1">
            <Field statePath="firstName" label="First name" rules={{ required: true }} />
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />);
    click(container, 'Validate');
    expect(textOf(container, 'error-firstName')).toBe('Du må fylle ut: First name');

    renderApp(root, <Harness />, 'en');
    expect(textOf(container, 'error-firstName')).toBe('EN:Du må fylle ut: First name');
  });

  it('keeps the registrations of a page that unmounted, so the summary can validate it', () => {
    const Harness = () => {
      const { validatePages } = useValidation();
      const [failedPageKeys, setFailedPageKeys] = useState<string[]>([]);
      const [showPage, setShowPage] = useState(true);

      return (
        <>
          <button type="button" onClick={() => setFailedPageKeys(validatePages(['page1']))}>
            Validate
          </button>
          <button type="button" onClick={() => setShowPage(false)}>
            Leave page
          </button>
          <span data-testid="failed-pages">{JSON.stringify(failedPageKeys)}</span>
          {showPage && (
            <ValidationScopeProvider pageKey="page1">
              <Field statePath="firstName" label="First name" rules={{ required: true }} />
            </ValidationScopeProvider>
          )}
        </>
      );
    };

    renderApp(root, <Harness />);
    click(container, 'Leave page');
    click(container, 'Validate');

    expect(textOf(container, 'failed-pages')).toBe('["page1"]');
  });

  it('validates every visited page from the summary page', () => {
    const Harness = () => {
      const { validatePages } = useValidation();
      const [failedPageKeys, setFailedPageKeys] = useState<string[]>([]);
      const [pageKey, setPageKey] = useState('page1');

      return (
        <>
          <button type="button" onClick={() => setFailedPageKeys(validatePages(['page1', 'page2']))}>
            Validate
          </button>
          <button type="button" onClick={() => setPageKey('page2')}>
            Next page
          </button>
          <span data-testid="failed-pages">{JSON.stringify(failedPageKeys)}</span>
          {/* One scope instance per page, the way the form page renders it. */}
          <ValidationScopeProvider key={pageKey} pageKey={pageKey}>
            {pageKey === 'page1' ? (
              <Field statePath="firstName" label="First name" rules={{ required: true }} />
            ) : (
              <Field statePath="surname" label="Surname" rules={{ required: true }} />
            )}
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />, 'nb', { surname: 'Lovelace' });
    click(container, 'Next page');
    click(container, 'Validate');

    expect(textOf(container, 'failed-pages')).toBe('["page1"]');
    expect(textOf(container, 'error-surname')).toBe('');
  });

  it('drops the registration of a field that stops rendering inside the page', () => {
    const Harness = () => {
      const { validatePages } = useValidation();
      const [failedPageKeys, setFailedPageKeys] = useState<string[]>([]);
      const [showConditionalField, setShowConditionalField] = useState(true);

      return (
        <>
          <button type="button" onClick={() => setFailedPageKeys(validatePages(['page1']))}>
            Validate
          </button>
          <button type="button" onClick={() => setShowConditionalField(false)}>
            Hide field
          </button>
          <span data-testid="failed-pages">{JSON.stringify(failedPageKeys)}</span>
          <ValidationScopeProvider pageKey="page1">
            <Field statePath="firstName" label="First name" rules={{ required: false }} />
            {showConditionalField && <Field statePath="surname" label="Surname" rules={{ required: true }} />}
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />);
    click(container, 'Validate');

    expect(textOf(container, 'failed-pages')).toBe('["page1"]');
    expect(textOf(container, 'error-surname')).toBe('Du må fylle ut: Surname');

    click(container, 'Hide field');
    click(container, 'Validate');

    expect(textOf(container, 'failed-pages')).toBe('[]');
  });

  it('revalidates a page while it shows errors', () => {
    const Harness = () => {
      const { validatePage, hasErrorState } = useValidation();

      return (
        <>
          <button type="button" onClick={() => validatePage('page1')}>
            Next
          </button>
          <span data-testid="page-state">{hasErrorState('page1') ? 'invalid' : 'valid'}</span>
          <ValidationScopeProvider pageKey="page1">
            <Field statePath="firstName" label="First name" rules={{ required: true }} />
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />);
    click(container, 'Next');
    expect(textOf(container, 'page-state')).toBe('invalid');

    type(container, 'firstName', 'Ada');
    expect(textOf(container, 'page-state')).toBe('valid');
  });

  it('validates rows of a data grid through their indexed state paths', () => {
    const Harness = () => {
      const { validatePages } = useValidation();
      const [rows, setRows] = useState([0, 1]);

      return (
        <>
          <button type="button" onClick={() => validatePages(['page1'])}>
            Validate
          </button>
          <button type="button" onClick={() => setRows([0])}>
            Remove row
          </button>
          <ValidationScopeProvider pageKey="page1">
            {rows.map((index) => (
              <Field key={index} statePath={`grid[${index}].name`} label="Name" rules={{ required: true }} />
            ))}
          </ValidationScopeProvider>
        </>
      );
    };

    renderApp(root, <Harness />, 'nb', { grid: [{ name: 'Ada' }, {}] });
    click(container, 'Validate');

    expect(textOf(container, 'error-grid[1].name')).toBe('Du må fylle ut: Name');

    click(container, 'Remove row');
    click(container, 'Validate');

    expect(textOf(container, 'error-grid[0].name')).toBe('');
    expect(container.querySelector('[data-testid="error-grid[1].name"]')).toBeNull();
  });

  it('validates attachment paths that are not bound to the state store', () => {
    const Harness = () => {
      const { getError, getErrorsForPage, validatePages, setAttachmentExternalError } = useValidation();
      const valuePath = attachmentValidationPath('documentation', 'value');
      const filesPath = attachmentValidationPath('documentation', 'files');

      return (
        <>
          <button type="button" onClick={() => validatePages(['attachments'])}>
            Validate
          </button>
          <button
            type="button"
            onClick={() => setAttachmentExternalError('documentation', 'files', 'Opplasting feilet')}
          >
            Fail upload
          </button>
          <span data-testid="value-error">{getError(valuePath, 'attachments') ?? ''}</span>
          <span data-testid="files-error">{getError(filesPath, 'attachments') ?? ''}</span>
          <span data-testid="all-errors">
            {JSON.stringify(getErrorsForPage('attachments').map((error) => error.message))}
          </span>
          <ValidationScopeProvider pageKey="attachments">
            <AttachmentFields />
          </ValidationScopeProvider>
        </>
      );
    };

    // Attachment paths have no state-bound input, so they are declared the way the upload controls
    // declare them.
    const AttachmentFields = () => (
      <>
        <ValidationRegistration
          label="Documentation"
          statePath={attachmentValidationPath('documentation', 'value')}
          value="leggerVedNaa"
          rules={{ required: true }}
        />
        <ValidationRegistration
          label="Documentation"
          statePath={attachmentValidationPath('documentation', 'files')}
          value={[]}
          rules={{ requiredFiles: true }}
        />
      </>
    );

    renderApp(root, <Harness />);
    click(container, 'Validate');

    expect(textOf(container, 'value-error')).toBe('');
    expect(textOf(container, 'files-error')).toBe('Du må laste opp fil: Documentation');

    click(container, 'Fail upload');
    click(container, 'Validate');

    expect(textOf(container, 'all-errors')).toBe(
      JSON.stringify(['Du må laste opp fil: Documentation', 'Opplasting feilet']),
    );
  });
});
