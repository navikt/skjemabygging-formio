import correlator from 'express-correlation-id';
import http from '../../shared/http/http';
import commonCodesClient from './commonCodesClient';

vi.mock('express-correlation-id', () => ({
  default: {
    getId: vi.fn(),
  },
}));

vi.mock('../../shared/http/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('commonCodesClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requests code descriptions with required headers', async () => {
    vi.mocked(correlator.getId).mockReturnValue('corr-id');
    vi.mocked(http.get).mockResolvedValueOnce({ betydninger: {} });

    await commonCodesClient.getCodeDescriptions({
      baseUrl: 'http://kodeverk.test',
      commonCode: 'TemaIFyllUt',
      languageCode: 'nb',
      consumerId: 'test-client',
      accessToken: 'azure-token',
    });

    expect(http.get).toHaveBeenCalledWith(
      'http://kodeverk.test/api/v1/kodeverk/TemaIFyllUt/koder/betydninger?ekskluderUgyldige=true&spraak=nb',
      {
        headers: {
          'Nav-Call-Id': 'corr-id',
          'Nav-Consumer-Id': 'test-client',
          Authorization: 'Bearer azure-token',
        },
      },
    );
  });
});
