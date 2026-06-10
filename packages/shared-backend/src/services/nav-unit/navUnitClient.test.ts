import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import navUnitClient from './navUnitClient';

vi.mock('../../shared/http/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../shared/logger/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('navUnitClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requests nav units with consumerId header', async () => {
    const navUnits = [{ enhetId: 1 }] as Enhet[];
    vi.mocked(http.get).mockResolvedValueOnce(navUnits);

    const result = await navUnitClient.getNavUnits({
      baseUrl: 'http://norg2.org',
      consumerId: 'test-client',
    });

    expect(http.get).toHaveBeenCalledWith('http://norg2.org/norg2/api/v1/enhet?enhetStatusListe=AKTIV', {
      headers: { consumerId: 'test-client' },
    });
    expect(result).toEqual(navUnits);
  });
});
