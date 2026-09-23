import { Component, Form, Submission, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import renderApplicationPdf from './renderApplicationPdf';

const documentComponent: Component = {
  key: 'document',
  label: 'Documentation',
  type: 'attachment',
  navId: 'document-nav-id',
  input: true,
};

const createGrid = (key: string, components: Component[]): Component => ({
  key,
  label: key,
  type: 'datagrid',
  input: true,
  tree: true,
  components,
});

const createAttachment = (attachmentId: string, value: string): SubmissionAttachment => ({
  attachmentId,
  navId: documentComponent.navId!,
  type: 'default',
  value,
  files: [],
});

const render = (components: Component[], submission: Submission, submissionMethod: 'paper' | 'digital' = 'paper') => {
  const form: Form = {
    title: 'Attachment test',
    path: 'attachment-test',
    skjemanummer: 'test',
    properties: {
      skjemanummer: 'test',
      tema: 'BIL',
      submissionTypes: ['PAPER', 'DIGITAL'],
      subsequentSubmissionTypes: [],
    },
    components: [{ key: 'panel', label: 'Panel', type: 'panel', components }],
  };

  return renderApplicationPdf({ form, submission, language: 'nb', translations: {}, submissionMethod })
    ?.verdiliste?.[0];
};

const answer = (value: string) => ({ label: 'Documentation', verdi: value });

describe('renderApplicationPdf attachment row scope', () => {
  it('keeps an unmatched primitive row answer when another row has authoritative legacy storage', () => {
    expect(
      render(
        [createGrid('rows', [documentComponent])],
        {
          data: { rows: [{ document: 'leggerVedNaa' }, { document: 'leggerVedNaa' }, {}] },
          attachments: [createAttachment('document-nav-id-rows-0-document', 'ettersender')],
        },
        'paper',
      ),
    ).toEqual({
      label: 'Panel',
      verdiliste: [
        { label: 'rows 1', verdiliste: [answer(TEXTS.statiske.attachment.ettersender)] },
        { label: 'rows 2', verdiliste: [answer(TEXTS.statiske.attachment.leggerVedNaa)] },
        { label: 'rows 3', verdiliste: [] },
      ],
    });
  });

  it('does not let obsolete legacy storage hide a primitive row beside a canonical row', () => {
    expect(
      render(
        [createGrid('rows', [documentComponent])],
        {
          data: {
            rows: [
              { document: createAttachment('canonical-document', 'ettersender') },
              { document: { key: 'leggerVedNaa' } },
              {},
            ],
          },
          attachments: [createAttachment('document-nav-id-rows-1-document', 'harIkke')],
        },
        'paper',
      ),
    ).toEqual({
      label: 'Panel',
      verdiliste: [
        { label: 'rows 1', verdiliste: [answer(TEXTS.statiske.attachment.ettersender)] },
        { label: 'rows 2', verdiliste: [answer(TEXTS.statiske.attachment.leggerVedNaa)] },
        { label: 'rows 3', verdiliste: [] },
      ],
    });
  });

  it('keeps legacy paper choices in their own rows after attachment normalization', () => {
    expect(
      render([createGrid('rows', [documentComponent])], {
        data: { rows: [{ document: { key: 'ettersender' } }, { document: { key: 'harIkke' } }, {}] },
      }),
    ).toEqual({
      label: 'Panel',
      verdiliste: [
        { label: 'rows 1', verdiliste: [answer(TEXTS.statiske.attachment.ettersender)] },
        { label: 'rows 2', verdiliste: [answer(TEXTS.statiske.attachment.harIkke)] },
        { label: 'rows 3', verdiliste: [] },
      ],
    });
  });

  it.each(['paper', 'digital'] as const)(
    'keeps mixed canonical and legacy answers scoped through nested grids and containers in %s PDFs',
    (submissionMethod) => {
      const container: Component = {
        key: 'details',
        label: 'Details',
        type: 'container',
        input: true,
        tree: true,
        components: [createGrid('documents', [documentComponent])],
      };
      const uploadLater =
        submissionMethod === 'paper' ? TEXTS.statiske.attachment.ettersender : TEXTS.statiske.attachment.uploadLater;
      const dontHave =
        submissionMethod === 'paper' ? TEXTS.statiske.attachment.harIkke : TEXTS.statiske.attachment.dontHave;

      expect(
        render(
          [createGrid('rows', [container])],
          {
            data: {
              rows: [
                {
                  details: {
                    documents: [
                      { document: createAttachment('document-nav-id', 'ettersender') },
                      { document: 'harIkke' },
                      {},
                    ],
                  },
                },
                {
                  details: {
                    documents: [{ document: [createAttachment('document-nav-id', 'harIkke')] }, {}],
                  },
                },
              ],
            },
          },
          submissionMethod,
        ),
      ).toEqual({
        label: 'Panel',
        verdiliste: [
          {
            label: 'rows 1',
            verdiliste: [
              { label: 'documents 1', verdiliste: [answer(uploadLater)] },
              { label: 'documents 2', verdiliste: [answer(dontHave)] },
              { label: 'documents 3', verdiliste: [] },
            ],
          },
          {
            label: 'rows 2',
            verdiliste: [
              { label: 'documents 1', verdiliste: [answer(dontHave)] },
              { label: 'documents 2', verdiliste: [] },
            ],
          },
        ],
      });
    },
  );

  it('matches legacy top-level row attachments by their scoped IDs, not array order or shared navId', () => {
    expect(
      render(
        [createGrid('rows', [documentComponent])],
        {
          data: { rows: [{ document: 'ettersender' }, { document: 'harIkke' }, {}] },
          attachments: [
            createAttachment('document-nav-id-rows-1-document', 'harIkke'),
            createAttachment('document-nav-id-rows-0-document', 'leggerVedNaa'),
            createAttachment('document-nav-id', 'levertTidligere'),
          ],
        },
        'digital',
      ),
    ).toEqual({
      label: 'Panel',
      verdiliste: [
        { label: 'rows 1', verdiliste: [answer(TEXTS.statiske.attachment.uploadNow)] },
        { label: 'rows 2', verdiliste: [answer(TEXTS.statiske.attachment.dontHave)] },
        { label: 'rows 3', verdiliste: [] },
      ],
    });
  });

  it.each([false, true])('preserves non-grid attachment precedence (canonical data: %s)', (canonical) => {
    const legacyAttachment: SubmissionAttachment = {
      ...createAttachment('document-nav-id', 'leggerVedNaa'),
      type: 'other',
      title: 'Uploaded document',
      files: [
        {
          fileId: 'file-1',
          attachmentId: 'document-nav-id',
          innsendingId: 'submission-1',
          fileName: 'document.pdf',
          size: 123,
        },
      ],
    };
    expect(
      render(
        [{ ...documentComponent, attachmentType: 'other' }],
        {
          data: {
            document: canonical ? [createAttachment('canonical-document', 'ettersender')] : { key: 'ettersender' },
          },
          attachments: [legacyAttachment],
        },
        'digital',
      ),
    ).toEqual({
      label: 'Panel',
      verdiliste: [
        canonical
          ? answer(TEXTS.statiske.attachment.uploadLater)
          : { label: 'Documentation - Uploaded document', verdi: TEXTS.statiske.attachment.uploadNow },
      ],
    });
  });
});
