import { Download } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expect } from '../fixtures/test';

const expectPdf = async (download: Download) => {
  expect(download.suggestedFilename()).toMatch(/^sendinnjourney-\d{8}\.pdf$/);
  const stream = await download.createReadStream();
  if (!stream) throw new Error('Expected downloaded PDF bytes.');
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const pdf = Buffer.concat(chunks);
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf).toEqual(await readFile('../../mocks/mocks/data/innsending-api/files/mini.pdf'));
};

export { expectPdf };
