import { describe, expect, it } from 'vitest';
import { normalizeAttachmentDownloadFileName } from './attachmentUploadUtils';

describe('normalizeAttachmentDownloadFileName', () => {
  it.each([
    ['receipt', 'receipt.pdf'],
    ['receipt.jpg', 'receipt.pdf'],
    ['receipt.PDF', 'receipt.pdf'],
    ['   ', 'attachment.pdf'],
    ['receipt...', 'receipt.pdf'],
    ['archive.tar.gz', 'archive.tar.pdf'],
    ['.env', 'attachment.pdf'],
    ['folder.name/receipt', 'folder.name/receipt.pdf'],
    ['folder.name\\receipt', 'folder.name\\receipt.pdf'],
    [`receipt${'.'.repeat(10_000)}txt`, 'receipt.pdf'],
  ])('normalizes %s to %s', (fileName, expected) => {
    expect(normalizeAttachmentDownloadFileName(fileName)).toBe(expected);
  });
});
