import { describe, expect, it, vi } from 'vitest';
import { createDecorator } from './decorator';

const setup = (enabled: boolean) => {
  const fetchDecoratorHtml = vi.fn().mockResolvedValue({ DECORATOR_HEADER: '<header />' });
  const { getDecorator } = createDecorator({
    enabled,
    env: 'dev',
    fetchDecoratorHtml,
    logger: { debug: vi.fn() },
    params: { level: 'Level4', simple: true },
  });
  return { fetchDecoratorHtml, getDecorator };
};

describe('createDecorator', () => {
  it('fetches decorator fragments with configured params and redirect url', async () => {
    const { fetchDecoratorHtml, getDecorator } = setup(true);

    const result = await getDecorator({ redirectToUrl: 'https://example.nav.no/sendinn' });

    expect(result).toEqual({ DECORATOR_HEADER: '<header />' });
    expect(fetchDecoratorHtml).toHaveBeenCalledWith({
      env: 'dev',
      params: { level: 'Level4', simple: true, redirectToUrl: 'https://example.nav.no/sendinn' },
    });
  });

  it('adds language to the params when given', async () => {
    const { fetchDecoratorHtml, getDecorator } = setup(true);

    await getDecorator({ redirectToUrl: 'https://example.nav.no/sendinn', language: 'en' });

    expect(fetchDecoratorHtml).toHaveBeenCalledWith({
      env: 'dev',
      params: { level: 'Level4', simple: true, redirectToUrl: 'https://example.nav.no/sendinn', language: 'en' },
    });
  });

  it('returns empty fragments without fetching when disabled', async () => {
    const { fetchDecoratorHtml, getDecorator } = setup(false);

    expect(await getDecorator({ redirectToUrl: 'https://example.nav.no/sendinn' })).toEqual({});
    expect(fetchDecoratorHtml).not.toHaveBeenCalled();
  });
});
