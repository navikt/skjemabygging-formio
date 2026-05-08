import { downloadBlob } from './blob';

describe('blob', () => {
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

  it('downloads blob content through an object url and cleans it up afterwards', () => {
    const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
    const originalCreateElement = document.createElement.bind(document);
    const link = originalCreateElement('a');
    const clickSpy = vi.spyOn(link, 'click').mockImplementation(() => {});
    const createObjectURLMock = vi.fn(() => 'blob:test-url');
    const revokeObjectURLMock = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLMock,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      configurable: true,
    });
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(((
      tagName: string,
      options?: ElementCreationOptions,
    ) => {
      if (tagName === 'a') {
        return link;
      }

      return originalCreateElement(tagName, options);
    }) as typeof document.createElement);

    downloadBlob(blob, 'application.pdf');

    expect(createObjectURLMock).toHaveBeenCalledWith(blob);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(link.href).toBe('blob:test-url');
    expect(link.download).toBe('application.pdf');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
  });
});
