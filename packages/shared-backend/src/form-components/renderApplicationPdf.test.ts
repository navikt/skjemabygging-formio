import { Form, PdfData, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import renderApplicationPdf from './renderApplicationPdf';

const digitalOnlyLabel = 'Digital only checkbox';

const form = {
  title: 'Test form',
  path: 'testform',
  type: 'form',
  display: 'wizard',
  properties: { skjemanummer: 'TEST-1', submissionTypes: ['PAPER', 'DIGITAL'] },
  components: [
    {
      title: 'Panel',
      key: 'panel',
      type: 'panel',
      navId: 'panelNavId',
      components: [
        {
          label: digitalOnlyLabel,
          key: 'digitalOnly',
          type: 'navCheckbox',
          input: true,
          navId: 'digitalOnlyNavId',
          customConditional: 'show = instance.isSubmissionDigital();',
        },
      ],
    },
  ],
} as unknown as Form;

const submission: Submission = { data: { digitalOnly: true } };

const collectLabels = (items: PdfData[] = []): string[] =>
  items.flatMap((item) => [...(item.label ? [item.label] : []), ...collectLabels(item.verdiliste)]);

const renderLabels = (submissionMethod: 'digital' | 'paper') =>
  collectLabels(
    renderApplicationPdf({ form, submission, language: 'nb', translations: {}, submissionMethod })?.verdiliste,
  );

describe('renderApplicationPdf', () => {
  it('includes a component conditional on digital submission when submission method is digital', () => {
    expect(renderLabels('digital')).toContain(digitalOnlyLabel);
  });

  it('excludes a component conditional on digital submission when submission method is paper', () => {
    expect(renderLabels('paper')).not.toContain(digitalOnlyLabel);
  });
});
