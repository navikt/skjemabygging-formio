import {
  formioFormsApiUtils,
  NavFormType,
  navFormUtils,
  Submission,
  SubmissionMethod,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { readFileSync } from 'fs';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import renderPdfForm from './RenderPdfForm';
import noIntropage from './__fixtures__/testPreview-no-intropage.json';
import subDigital from './__fixtures__/testPreview-sub-digital.json';
import subNone from './__fixtures__/testPreview-sub-none.json';

const FIXED_DATE = new Date('2024-01-15T10:30:00Z');

const renderFixture = (form: NavFormType, submissionMethod: SubmissionMethod | undefined) => {
  const submission: Submission = { data: {} } as Submission;
  const translate = translationUtils.createTranslate({}, 'nb-NO');
  const mappedForm = formioFormsApiUtils.mapNavFormToForm(form);
  const activeComponents = navFormUtils.getActiveComponentsFromForm(mappedForm, submission);
  const activeAttachmentUploadsPanel =
    submissionMethod !== 'digital' ? navFormUtils.getActiveAttachmentPanelFromForm(mappedForm, submission) : undefined;

  return renderPdfForm({
    activeComponents,
    activeAttachmentUploadsPanel,
    submission,
    form: mappedForm,
    currentLanguage: 'nb-NO',
    translate: (text, replacements) => (text ? `${translate(text, replacements)}` : ''),
    submissionMethod,
    appConfig: { config: { gitVersion: 'snapshot-test' } } as never,
  });
};

const readExpectedBaseline = (name: string) =>
  readFileSync(path.join(process.cwd(), 'src/form-components/__snapshots__', `${name}.txt`), 'utf8').trimEnd();

const normalizeForBaseline = (value: unknown): unknown => {
  if (value === undefined) {
    return '__undefined__';
  }

  if (Array.isArray(value)) {
    return value.map(normalizeForBaseline);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
        key,
        normalizeForBaseline(entryValue),
      ]),
    );
  }

  return value;
};

describe('RenderPdfForm snapshot baseline', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders testPreview-sub-digital with submissionMethod=digital', () => {
    const result = renderFixture(subDigital as unknown as NavFormType, 'digital');
    expect(JSON.stringify(normalizeForBaseline(result), null, 2)).toBe(readExpectedBaseline('testPreview-sub-digital'));
  });

  it('renders testPreview-sub-none with submissionMethod=paper', () => {
    const result = renderFixture(subNone as unknown as NavFormType, 'paper');
    expect(JSON.stringify(normalizeForBaseline(result), null, 2)).toBe(readExpectedBaseline('testPreview-sub-none'));
  });

  it('renders testPreview-no-intropage with submissionMethod=undefined', () => {
    const result = renderFixture(noIntropage as unknown as NavFormType, undefined);
    expect(JSON.stringify(normalizeForBaseline(result), null, 2)).toBe(
      readExpectedBaseline('testPreview-no-intropage'),
    );
  });
});
