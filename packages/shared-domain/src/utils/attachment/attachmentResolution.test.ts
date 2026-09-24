import { Component, Form, Submission, SubmissionAttachment } from '../../models';
import { attachmentUtils } from './attachmentUtils';

const component: Component = {
  key: 'documentation',
  navId: 'doc',
  label: 'Documentation',
  type: 'attachment',
  properties: { vedleggskode: 'N6' },
};
const form = { components: [component] } as Form;
const createAttachment = (
  value: string | undefined,
  attachmentId = 'doc',
  type: SubmissionAttachment['type'] = 'default',
): SubmissionAttachment => ({
  attachmentId,
  navId: 'doc',
  type,
  value,
  title: attachmentId,
  files: [
    {
      fileId: `${attachmentId}-file`,
      attachmentId,
      innsendingId: 'submission',
      fileName: `${attachmentId}.pdf`,
      size: 123,
    },
  ],
});

describe('attachment resolution shared by summary, PDF and submission metadata', () => {
  it.each([
    ['leggerVedNaa', 'ettersender'],
    ['ettersender', 'leggerVedNaa'],
    ['leggerVedNaa', ''],
    ['leggerVedNaa', undefined],
  ])('preserves complete legacy records for choices %s -> %s', (dataValue, legacyValue) => {
    const legacy = { ...createAttachment(legacyValue), additionalDocumentation: 'Legacy explanation' };
    for (const answer of [dataValue, { key: dataValue }, undefined, '']) {
      const submission: Submission = {
        data: answer === undefined ? {} : { documentation: answer },
        attachments: [legacy],
      };
      expect(attachmentUtils.resolveSubmissionAttachments(form, submission)).toEqual([legacy]);
      expect(attachmentUtils.resolveAttachmentsAtPath(component, 'documentation', submission)).toEqual({
        attachments: [legacy],
        source: 'top-level',
      });
    }
  });

  it.each(['leggerVedNaa', 'ettersender', '', undefined])(
    'uses canonical data and its download path even when the choice is %s',
    (value) => {
      const canonical = createAttachment(value, 'canonical');
      const legacy = createAttachment(value === 'leggerVedNaa' ? 'ettersender' : 'leggerVedNaa', 'legacy');
      for (const answer of [canonical, [canonical]]) {
        const submission = { data: { documentation: answer }, attachments: [legacy] };
        expect(attachmentUtils.resolveSubmissionAttachments(form, submission)).toEqual([canonical]);
        expect(attachmentUtils.resolveAttachmentsAtPath(component, 'documentation', submission)).toEqual({
          attachments: [canonical],
          source: 'data',
        });
      }
    },
  );

  it('uses primitive answers only when no matching legacy record exists', () => {
    const unrelated = { ...createAttachment('ettersender'), navId: 'unrelated' };
    for (const answer of ['leggerVedNaa', { key: 'leggerVedNaa', additionalDocumentation: 'Explanation' }]) {
      const submission = { data: { documentation: answer }, attachments: [unrelated] };
      const normalized = attachmentUtils.toSubmissionAttachments(answer, component);
      expect(attachmentUtils.resolveSubmissionAttachments(form, submission)).toEqual([...normalized, unrelated]);
      expect(attachmentUtils.resolveAttachmentsAtPath(component, 'documentation', submission)).toEqual({
        attachments: normalized,
        source: 'data',
      });
    }
  });

  it('retains empty-array legacy fallback, matching existing hydration semantics', () => {
    const legacy = createAttachment('leggerVedNaa');
    const submission = { data: { documentation: [] }, attachments: [legacy] };
    expect(attachmentUtils.resolveSubmissionAttachments(form, submission)).toEqual([legacy]);
    expect(attachmentUtils.resolveAttachmentsAtPath(component, 'documentation', submission)).toEqual({
      attachments: [legacy],
      source: 'top-level',
    });
  });

  it('preserves all legacy other documents, but replaces the entire collection with canonical data', () => {
    const other = { ...component, attachmentType: 'other' as const };
    const otherForm = { components: [other] } as Form;
    const legacy = [
      createAttachment('ettersender', 'legacy', 'other'),
      createAttachment('leggerVedNaa', 'legacy-1', 'other'),
    ];
    const submission: Submission = { data: { documentation: { key: 'nei' } }, attachments: legacy };
    expect(attachmentUtils.resolveAttachmentsAtPath(other, 'documentation', submission).attachments).toEqual(legacy);
    expect(attachmentUtils.resolveSubmissionAttachments(otherForm, submission)).toEqual(legacy);
    expect(attachmentUtils.getAttachmentsForCoverPage(submission, otherForm)).toEqual([other]);

    const canonical = [createAttachment('nei', 'canonical', 'other')];
    submission.data.documentation = canonical;
    expect(attachmentUtils.resolveAttachmentsAtPath(other, 'documentation', submission).attachments).toEqual(canonical);
    expect(attachmentUtils.resolveSubmissionAttachments(otherForm, submission)).toEqual(canonical);
    expect(attachmentUtils.getAttachmentsForCoverPage(submission, otherForm)).toEqual([]);
  });

  describe('row scope', () => {
    const rowForm = {
      components: [{ key: 'rows', type: 'datagrid', input: true, components: [component] }],
    } as Form;

    it('does not let another row suppress a primitive answer or populate an unanswered row', () => {
      const legacy = createAttachment('ettersender', 'doc-rows-0-documentation');
      const submission = {
        data: { rows: [{ documentation: 'leggerVedNaa' }, { documentation: 'leggerVedNaa' }, {}] },
        attachments: [legacy],
      };
      const normalized = {
        ...submission,
        attachments: attachmentUtils.resolveSubmissionAttachments(rowForm, submission),
      };
      expect(normalized.attachments).toEqual([
        { attachmentId: 'doc', navId: 'doc', type: 'default', value: 'leggerVedNaa', files: [] },
        legacy,
      ]);
      expect(attachmentUtils.resolveAttachmentsAtPath(component, 'rows[0].documentation', normalized)).toEqual({
        attachments: [legacy],
        source: 'top-level',
      });
      expect(
        attachmentUtils.resolveAttachmentsAtPath(component, 'rows[1].documentation', normalized).attachments[0].value,
      ).toBe('leggerVedNaa');
      expect(
        attachmentUtils.resolveAttachmentsAtPath(component, 'rows[2].documentation', normalized).attachments,
      ).toEqual([]);
      expect(attachmentUtils.getAttachmentsForCoverPage(submission, rowForm)).toEqual([component]);
    });

    it('drops obsolete top-level records without suppressing a different row primitive answer', () => {
      const canonical = createAttachment('ettersender', 'canonical');
      const obsolete = createAttachment('harIkke', 'doc-rows-1-documentation');
      const submission = {
        data: { rows: [{ documentation: canonical }, { documentation: { key: 'leggerVedNaa' } }, {}] },
        attachments: [obsolete],
      };
      const normalized = {
        ...submission,
        attachments: attachmentUtils.resolveSubmissionAttachments(rowForm, submission),
      };
      expect(normalized.attachments.map(({ value }) => value)).toEqual(['ettersender', 'leggerVedNaa']);
      expect(attachmentUtils.getAttachmentsForCoverPage(submission, rowForm)).toEqual([component]);
      expect(
        attachmentUtils.resolveAttachmentsAtPath(component, 'rows[1].documentation', normalized).attachments[0].value,
      ).toBe('leggerVedNaa');
    });

    it('resolves other-document suffixes only within the matching row', () => {
      const attachments = [
        createAttachment('leggerVedNaa', 'doc-rows-0-documentation', 'other'),
        createAttachment('leggerVedNaa', 'doc-rows-0-documentation-1', 'other'),
        createAttachment('ettersender', 'doc-rows-1-documentation', 'other'),
        createAttachment('leggerVedNaa', 'doc', 'other'),
      ];
      expect(
        attachmentUtils.resolveAttachmentsAtPath({ ...component, attachmentType: 'other' }, 'rows[0].documentation', {
          data: { rows: [{ documentation: 'ettersender' }] },
          attachments,
        }),
      ).toEqual({ attachments: attachments.slice(0, 2), source: 'top-level' });
    });
  });
});
