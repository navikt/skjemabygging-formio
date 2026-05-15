import {
  formioFormsApiUtils,
  NavFormType,
  navFormUtils,
  Submission,
  SubmissionMethod,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import renderPdfForm from './RenderPdfForm';
import noIntropage from './__fixtures__/testPreview-no-intropage.json';
import subDigital from './__fixtures__/testPreview-sub-digital.json';
import subNone from './__fixtures__/testPreview-sub-none.json';

const FIXED_DATE = new Date('2024-01-15T10:30:00Z');

const renderFixture = (form: NavFormType, submissionMethod: SubmissionMethod | undefined) => {
  const submission: Submission = { data: {} } as Submission;
  const translate = translationUtils.createTranslate({}, 'nb-NO');
  const activeComponents = navFormUtils.getActiveComponentsFromForm(form, submission);
  const activeAttachmentUploadsPanel =
    submissionMethod !== 'digital' ? navFormUtils.getActiveAttachmentPanelFromForm(form, submission) : undefined;

  return renderPdfForm({
    activeComponents,
    activeAttachmentUploadsPanel,
    submission,
    form: formioFormsApiUtils.mapNavFormToForm(form),
    currentLanguage: 'nb-NO',
    translate: (text, replacements) => (text ? `${translate(text, replacements)}` : ''),
    submissionMethod,
    appConfig: { config: { gitVersion: 'snapshot-test' } } as never,
  });
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
    expect(result).toMatchSnapshot();
  });

  it('renders testPreview-sub-none with submissionMethod=paper', () => {
    const result = renderFixture(subNone as unknown as NavFormType, 'paper');
    expect(result).toMatchSnapshot();
  });

  it('renders testPreview-no-intropage with submissionMethod=undefined', () => {
    const result = renderFixture(noIntropage as unknown as NavFormType, undefined);
    expect(result).toMatchSnapshot();
  });
});
