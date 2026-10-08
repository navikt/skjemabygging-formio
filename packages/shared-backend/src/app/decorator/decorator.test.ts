import { describe, expect, it, vi } from 'vitest';
import { createDecorator } from './decorator';

const setup = (enabled: boolean) => {
  const fetchDecoratorHtml = vi.fn().mockResolvedValue({ DECORATOR_HEADER: '<header />' });
  const logger = { debug: vi.fn() };
  const { getDecorator } = createDecorator({
    enabled,
    env: 'dev',
    fetchDecoratorHtml,
    logger,
    params: { level: 'Level4', simple: true },
  });
  return { fetchDecoratorHtml, getDecorator, logger };
};

describe('createDecorator', () => {
  it('fetches decorator fragments with configured params and redirect url', async () => {
    const { fetchDecoratorHtml, getDecorator } = setup(true);

    const result = await getDecorator('https://example.nav.no/sendinn');

    expect(result).toEqual({ DECORATOR_HEADER: '<header />' });
    expect(fetchDecoratorHtml).toHaveBeenCalledWith({
      env: 'dev',
      params: { level: 'Level4', simple: true, redirectToUrl: 'https://example.nav.no/sendinn' },
    });
  });

  it('returns empty fragments without fetching when disabled', async () => {
    const { fetchDecoratorHtml, getDecorator, logger } = setup(false);

    expect(await getDecorator('https://example.nav.no/sendinn')).toEqual({});
    expect(fetchDecoratorHtml).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('Skipping decorator');
  });
});
