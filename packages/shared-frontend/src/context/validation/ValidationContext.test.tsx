import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppConfigProvider } from '../app-config/AppConfigContext';
import { LanguageProvider } from '../language/LanguageContext';
import { SubmissionStateProvider } from '../state/SubmissionStateContext';
import { useValidation, ValidationProvider } from './ValidationContext';

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

const translate = (text?: string, params?: Record<string, string | number>) => {
  const translatedText = TEXTS.validering[text as keyof typeof TEXTS.validering] ?? text ?? '';

  return Object.entries(params ?? {}).reduce(
    (textWithReplacements, [key, value]) => textWithReplacements.replace(`{{${key}}}`, String(value)),
    translatedText,
  );
};

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
        <AppConfigProvider>
          <LanguageProvider translate={translate} currentLanguage="nb">
            <SubmissionStateProvider initialSubmission={{ data: { identityNumber: '123' } }}>
              <ValidationProvider>
                <ValidationHarness />
              </ValidationProvider>
            </SubmissionStateProvider>
          </LanguageProvider>
        </AppConfigProvider>,
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
});
