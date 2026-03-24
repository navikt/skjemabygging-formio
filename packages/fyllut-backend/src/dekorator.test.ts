import { NaisCluster } from './config/nais-cluster';

const fetchDecoratorHtmlMock = vi.fn();
const loggerDebugMock = vi.fn();
const getFyllutUrlMock = vi.fn();

vi.mock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
  fetchDecoratorHtml: fetchDecoratorHtmlMock,
}));

vi.mock('./logger', () => ({
  logger: { debug: loggerDebugMock },
}));

vi.mock('./utils/url', () => ({
  getFyllutUrl: getFyllutUrlMock,
}));

describe('dekorator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('includes sub in analyticsQueryParams for decorator config', async () => {
    vi.doMock('./config/config', () => ({
      config: {
        noDecorator: false,
        naisClusterName: NaisCluster.DEV,
      },
    }));
    const { getDecorator } = await import('./dekorator');

    fetchDecoratorHtmlMock.mockResolvedValue({});
    await getDecorator('https://example.nav.no/fyllut/nav123');

    expect(fetchDecoratorHtmlMock).toHaveBeenCalledWith({
      env: 'dev',
      params: {
        redirectToUrl: 'https://example.nav.no/fyllut/nav123',
        level: 'Level4',
        simple: true,
        logoutWarning: true,
        analyticsQueryParams: ['sub'],
      },
    });
  });

  it('returns empty object when decorator is disabled', async () => {
    vi.doMock('./config/config', () => ({
      config: {
        noDecorator: true,
        naisClusterName: NaisCluster.DEV,
      },
    }));
    const { getDecorator } = await import('./dekorator');

    const result = await getDecorator('https://example.nav.no/fyllut/nav123');

    expect(result).toEqual({});
    expect(fetchDecoratorHtmlMock).not.toHaveBeenCalled();
    expect(loggerDebugMock).toHaveBeenCalledWith('Skipping decorator');
  });

  it('creates redirect URL with form query when formId exists', async () => {
    vi.doMock('./config/config', () => ({
      config: {
        noDecorator: false,
        naisClusterName: NaisCluster.PROD,
      },
    }));
    const { createRedirectUrl } = await import('./dekorator');
    getFyllutUrlMock.mockReturnValue('https://example.nav.no/fyllut');

    const req = {} as never;
    const res = { locals: { formId: 'nav123456' } } as never;

    expect(createRedirectUrl(req, res)).toBe('https://example.nav.no/fyllut?form=nav123456');
  });

  it('creates redirect URL without query when formId is missing', async () => {
    vi.doMock('./config/config', () => ({
      config: {
        noDecorator: false,
        naisClusterName: NaisCluster.PROD,
      },
    }));
    const { createRedirectUrl } = await import('./dekorator');
    getFyllutUrlMock.mockReturnValue('https://example.nav.no/fyllut');

    const req = {} as never;
    const res = { locals: {} } as never;

    expect(createRedirectUrl(req, res)).toBe('https://example.nav.no/fyllut');
  });
});
