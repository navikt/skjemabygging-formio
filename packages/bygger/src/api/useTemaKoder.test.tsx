import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { renderHook, waitFor } from '@testing-library/react';
import { MockInstance } from 'vitest';
import createMockImplementation from '../../test/backendMockImplementation';
import useTemaKoder from './useTemaKoder';

describe('useTemaKoder', () => {
  let fetchSpy: MockInstance;
  let appConfig: any;
  const projectUrl = 'http://test.example.org';

  beforeEach(() => {
    appConfig = ({ children }) => <AppConfigProvider baseUrl={projectUrl}>{children}</AppConfigProvider>;
    fetchSpy = vi.spyOn(global, 'fetch');
    fetchSpy.mockImplementation(createMockImplementation({ projectUrl }));
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  it('returns ready: false and empty temakoder initially', async () => {
    const { result } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
    await waitFor(() => {
      expect(result.current.ready).toBe(false);
      expect(result.current.temaKoder).toEqual([]);
    });
  });

  it('fetches temakoder and returns them when ready', async () => {
    const { result } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(`${projectUrl}/api/temakoder`);
      expect(result.current.ready).toBe(true);
      expect(result.current.temaKoder).toEqual([{ key: 'TEST', value: 'test' }]);
    });
  });

  describe('When fetch returns with not ok', () => {
    let errorSpy: MockInstance;

    beforeEach(() => {
      errorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn() as () => Promise<void>);
    });

    afterEach(() => {
      errorSpy.mockClear();
    });

    it('returns an error message', async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response(null, { status: 503 })));
      const { result } = renderHook(() => useTemaKoder(), { wrapper: appConfig });
      await waitFor(() => {
        expect(result.current.errorMessage).toBe('Feil ved henting av temakoder. Vennligst prøv igjen senere.');
      });
    });
  });
});
