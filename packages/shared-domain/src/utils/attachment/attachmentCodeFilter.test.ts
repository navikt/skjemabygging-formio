import { Component } from '../../models';
import { filterAttachmentsByCode, normalizeAttachmentCodeFilter } from './attachmentCodeFilter';

describe('normalizeAttachmentCodeFilter', () => {
  it.each<{ input?: string | readonly string[] | null; expected: string[] }>([
    { input: undefined, expected: [] },
    { input: null, expected: [] },
    { input: '', expected: [] },
    { input: ' , \t, ', expected: [] },
    { input: [], expected: [] },
    { input: ['', ' , ', '\t'], expected: [] },
    { input: ' N6, N1 ,, N2 ', expected: ['N6', 'N1', 'N2'] },
    { input: [' N6, N1 ', ',', 'N2,, N6'], expected: ['N6', 'N1', 'N2', 'N6'] },
    { input: 'unknown', expected: ['unknown'] },
  ])('normalizes $input to $expected', ({ input, expected }) => {
    expect(normalizeAttachmentCodeFilter(input)).toEqual(expected);
  });

  it('accepts repeated URL query values without changing their order or case', () => {
    const query = new URLSearchParams('filter=N6%2C+N1&filter=+n2+&filter=');
    expect(normalizeAttachmentCodeFilter(query.getAll('filter'))).toEqual(['N6', 'N1', 'n2']);
  });
});

describe('filterAttachmentsByCode', () => {
  const createAttachment = (key: string, code?: string): Component => ({
    key,
    label: key,
    type: 'attachment',
    properties: { vedleggskode: code },
  });
  const attachments = [
    createAttachment('first', ' R4 '),
    createAttachment('second', 'K2'),
    createAttachment('duplicate', 'R4'),
    createAttachment('lowercase', 'r4'),
    createAttachment('uncoded'),
    createAttachment('emptyCode', '  '),
  ];

  it('returns all attachments when there is no active filter', () => {
    expect(filterAttachmentsByCode(attachments, [])).toBe(attachments);
  });

  it.each([
    { codes: ['R4'], expected: [attachments[0], attachments[2]] },
    { codes: ['K2', 'R4'], expected: attachments.slice(0, 3) },
    { codes: ['R4', 'ZZ'], expected: [attachments[0], attachments[2]] },
    { codes: ['ZZ'], expected: [] },
  ])('matches trimmed codes case-sensitively in source order for $codes', ({ codes, expected }) => {
    expect(filterAttachmentsByCode(attachments, codes)).toEqual(expected);
  });
});
