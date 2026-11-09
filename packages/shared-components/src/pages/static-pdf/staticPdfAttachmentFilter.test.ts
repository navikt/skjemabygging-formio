import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { getFilteredStaticPdfAttachments } from './staticPdfAttachmentFilter';

describe('getFilteredStaticPdfAttachments', () => {
  it('flattens nested attachments and applies the shared code filter without including other components', () => {
    const attachment: Component = {
      key: 'document',
      label: 'Document',
      type: 'attachment',
      properties: { vedleggskode: ' R4 ' },
    };
    const components: Component[] = [
      { key: 'question', label: 'Question', type: 'textfield', properties: { vedleggskode: 'R4' } },
      { key: 'panel', label: 'Panel', type: 'panel', components: [attachment] },
      { key: 'uncoded', label: 'Uncoded document', type: 'attachment' },
    ];

    expect(getFilteredStaticPdfAttachments(components, ' , R4, ')).toEqual([attachment]);
    expect(getFilteredStaticPdfAttachments(components, null)).toEqual([attachment, components[2]]);
  });
});
