import { Enhet } from '@navikt/skjemadigitalisering-shared-domain';
import { createNavUnitService } from './navUnitService';

describe('navUnitService', () => {
  it('delegates to client with configured baseUrl and consumerId', async () => {
    const navUnits = [{ enhetId: 1 }] as Enhet[];
    const client = {
      getNavUnits: vi.fn().mockResolvedValueOnce(navUnits),
    };

    const service = createNavUnitService({
      baseUrl: 'http://norg2.org',
      consumerId: 'test-client',
      client,
    });

    await expect(service.getNavUnits()).resolves.toEqual(navUnits);
    expect(client.getNavUnits).toHaveBeenCalledWith({
      baseUrl: 'http://norg2.org',
      consumerId: 'test-client',
    });
  });
});
