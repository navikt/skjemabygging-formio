import type { Component, Form, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import renderPdfForm from './RenderPdfForm';

const translate: TranslateFunction = ((text?: string) => text ?? '') as TranslateFunction;

const createForm = (): Form =>
  ({
    skjemanummer: 'NAV-00.00',
    path: 'test-form',
    title: 'Test form',
    components: [],
    properties: {
      skjemanummer: 'NAV-00.00',
      tema: 'TEST',
      submissionTypes: [],
      subsequentSubmissionTypes: [],
    },
  }) as Form;

const createSubmission = (): Submission =>
  ({
    data: {
      firstName: 'Test',
      surname: 'User',
    },
  }) as Submission;

describe('renderPdfForm', () => {
  it('uses the narrowed runtime for footer version and watermark', () => {
    const result = renderPdfForm({
      activeComponents: [] as Component[],
      form: createForm(),
      submission: createSubmission(),
      currentLanguage: 'nb',
      translate,
      runtime: {
        gitVersion: 'git-sha',
        isDelingslenke: true,
      },
    });

    expect(result?.bunntekst?.lowerMiddle).toBe('Versjon: git-sha');
    expect(result?.vannmerke).toBe('Testskjema - Ikke send til Nav');
  });
});
