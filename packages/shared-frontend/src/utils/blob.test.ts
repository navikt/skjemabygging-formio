import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob } from './blob';

describe('downloadBlob', () => {
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
  const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalCreateObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
    } else {
      delete (URL as Partial<typeof URL>).createObjectURL;
    }

    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
    } else {
      delete (URL as Partial<typeof URL>).revokeObjectURL;
    }
  });

  it('revokes the object URL after starting the download', () => {
    const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
    const originalCreateElement = document.createElement.bind(document);
    const link = originalCreateElement('a');
    const events: string[] = [];
    vi.spyOn(link, 'click').mockImplementation(() => {
      events.push('click');
    });
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:test-url'),
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(() => {
        events.push('revoke');
      }),
      configurable: true,
    });
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
      if (tagName === 'a') {
        return link;
      }
      return originalCreateElement(tagName, options);
    }) as typeof document.createElement);

    downloadBlob(blob, 'application.pdf');

    expect(link.href).toBe('blob:test-url');
    expect(link.download).toBe('application.pdf');
    expect(events).toEqual(['click', 'revoke']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });
});
