import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApplicationProvider } from '../application/ApplicationContext';
import { LanguageProvider } from '../language/LanguageContext';
import { SubmissionStateProvider } from '../state/SubmissionStateContext';
import { SubmissionMethodProvider } from '../submission-method/SubmissionMethodContext';
import { attachmentValidationPath, useValidation, ValidationProvider } from './ValidationContext';

const components = [
  {
    key: 'firstName',
    label: 'First name',
    input: true,
    type: 'textfield',
    validate: { required: true },
  },
  {
    key: 'identityNumber',
    label: 'National identity number',
    input: true,
    type: 'fnrfield',
  },
] as unknown as Component[];

const translations = Object.fromEntries(Object.entries(TEXTS.validering).map(([key, value]) => [key, { nb: value }]));

const ValidationHarness = () => {
  const { getError, validatePages } = useValidation();
  const [failedPageKeys, setFailedPageKeys] = useState<string[]>([]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFailedPageKeys(validatePages([{ pageKey: 'page1', components }]));
        }}
      >
        Validate pages
      </button>
      <span data-testid="failed-pages">{JSON.stringify(failedPageKeys)}</span>
      <span data-testid="field-error">{getError('firstName', 'page1', components) ?? ''}</span>
      <span data-testid="identity-number-error">{getError('identityNumber', 'page1', components) ?? ''}</span>
    </>
  );
};

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

  it('returns failed page keys and exposes cached page errors through getError', () => {
    act(() => {
      root.render(
        <ApplicationProvider environment="test">
          <LanguageProvider translations={translations} currentLanguage="nb" availableLanguages={['nb']}>
            <SubmissionStateProvider initialSubmission={{ data: { identityNumber: '123' } }}>
              <ValidationProvider>
                <ValidationHarness />
              </ValidationProvider>
            </SubmissionStateProvider>
          </LanguageProvider>
        </ApplicationProvider>,
      );
    });

    act(() => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.querySelector('[data-testid="failed-pages"]')?.textContent).toBe('["page1"]');
    expect(container.querySelector('[data-testid="field-error"]')?.textContent).toBe('Du må fylle ut: First name');
    expect(container.querySelector('[data-testid="identity-number-error"]')?.textContent).toBe(
      TEXTS.validering.fodselsnummerDNummer,
    );
  });

  it('assigns attachment choice and file errors to their upload controls', () => {
    const attachmentComponents = [
      {
        key: 'documentation',
        navId: 'documentation',
        label: 'Documentation',
        input: true,
        type: 'attachment',
        attachmentType: 'other',
        validate: { required: true },
      },
    ] as unknown as Component[];

    const AttachmentValidationHarness = () => {
      const { getError, validatePages } = useValidation();

      return (
        <>
          <button
            type="button"
            onClick={() => validatePages([{ pageKey: 'attachments', components: attachmentComponents }])}
          >
            Validate attachments
          </button>
          <span data-testid="attachment-value-error">
            {getError(attachmentValidationPath('documentation', 'value'), 'attachments', attachmentComponents) ?? ''}
          </span>
          <span data-testid="attachment-file-error">
            {getError(attachmentValidationPath('documentation', 'files'), 'attachments', attachmentComponents) ?? ''}
          </span>
          <span data-testid="attachment-title-error">
            {getError(attachmentValidationPath('documentation', 'title'), 'attachments', attachmentComponents) ?? ''}
          </span>
        </>
      );
    };

    act(() => {
      root.render(
        <ApplicationProvider environment="test">
          <LanguageProvider translations={translations} currentLanguage="nb" availableLanguages={['nb']}>
            <SubmissionMethodProvider submissionMethod="digital">
              <SubmissionStateProvider
                initialSubmission={{
                  data: {},
                  attachments: [
                    {
                      attachmentId: 'documentation',
                      navId: 'documentation',
                      type: 'other',
                      value: 'leggerVedNaa',
                      files: [],
                    },
                  ],
                }}
              >
                <ValidationProvider>
                  <AttachmentValidationHarness />
                </ValidationProvider>
              </SubmissionStateProvider>
            </SubmissionMethodProvider>
          </LanguageProvider>
        </ApplicationProvider>,
      );
    });

    act(() => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.querySelector('[data-testid="attachment-value-error"]')?.textContent).toBe('');
    expect(container.querySelector('[data-testid="attachment-file-error"]')?.textContent).toBe(
      'Du må laste opp fil: Documentation',
    );
    expect(container.querySelector('[data-testid="attachment-title-error"]')?.textContent).toBe('');
  });

  it('validates required paper attachments through their submission path', () => {
    const attachmentComponents = [
      {
        key: 'documentation',
        label: 'Documentation',
        input: true,
        type: 'attachment',
        validate: { required: true },
      },
    ] as unknown as Component[];

    const AttachmentValidationHarness = () => {
      const { getError, validatePages } = useValidation();

      return (
        <>
          <button
            type="button"
            onClick={() => validatePages([{ pageKey: 'attachments', components: attachmentComponents }])}
          >
            Validate attachments
          </button>
          <span data-testid="attachment-value-error">
            {getError('documentation', 'attachments', attachmentComponents) ?? ''}
          </span>
        </>
      );
    };

    act(() => {
      root.render(
        <ApplicationProvider environment="test">
          <LanguageProvider translations={translations} currentLanguage="nb" availableLanguages={['nb']}>
            <SubmissionMethodProvider submissionMethod="paper">
              <SubmissionStateProvider initialSubmission={{ data: {} }}>
                <ValidationProvider>
                  <AttachmentValidationHarness />
                </ValidationProvider>
              </SubmissionStateProvider>
            </SubmissionMethodProvider>
          </LanguageProvider>
        </ApplicationProvider>,
      );
    });

    act(() => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.querySelector('[data-testid="attachment-value-error"]')?.textContent).toBe(
      'Du må fylle ut: Documentation',
    );
  });
});
