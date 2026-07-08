import { EnhetstypeNorg } from '@navikt/skjemadigitalisering-shared-domain';
import { commonCodesService } from '../../services';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import commonCodes from './common-codes';

vi.mock('../../services', () => ({
  commonCodesService: {
    getArchiveSubjects: vi.fn(),
    getCurrencies: vi.fn(),
    getNavUnitTypes: vi.fn(),
    getAreaCodes: vi.fn(),
  },
}));

describe('commonCodes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('forwards archive subject params to commonCodesService', async () => {
    const req = mockRequest({
      headers: { AzureAccessToken: 'azure-token', 'accept-language': 'nn' },
    });
    const res = mockResponse();
    const archiveSubjects = { BIL: 'Bil' };
    vi.mocked(commonCodesService.getArchiveSubjects).mockResolvedValueOnce(archiveSubjects);

    await commonCodes.getArchiveSubjects(req, res);

    expect(commonCodesService.getArchiveSubjects).toHaveBeenCalledWith({
      languageCode: 'nn',
      accessToken: 'azure-token',
    });
    expect(res.send).toHaveBeenCalledWith(archiveSubjects);
  });

  it('forwards currency params to commonCodesService with query language', async () => {
    const req = mockRequest({
      headers: { AzureAccessToken: 'azure-token' },
      query: { lang: 'en' },
    });
    const res = mockResponse();
    const currencies = [{ label: 'Euro (EUR)', value: 'EUR' }];
    vi.mocked(commonCodesService.getCurrencies).mockResolvedValueOnce(currencies);

    await commonCodes.getCurrencies(req, res);

    expect(commonCodesService.getCurrencies).toHaveBeenCalledWith({
      languageCode: 'en',
      accessToken: 'azure-token',
    });
    expect(res.send).toHaveBeenCalledWith(currencies);
  });

  it('falls back to accept-language for currencies', async () => {
    const req = mockRequest({
      headers: { AzureAccessToken: 'azure-token', 'accept-language': 'nb' },
    });
    const res = mockResponse();
    const currencies = [{ label: 'Norsk krone (NOK)', value: 'NOK' }];
    vi.mocked(commonCodesService.getCurrencies).mockResolvedValueOnce(currencies);

    await commonCodes.getCurrencies(req, res);

    expect(commonCodesService.getCurrencies).toHaveBeenCalledWith({
      languageCode: 'nb',
      accessToken: 'azure-token',
    });
    expect(res.send).toHaveBeenCalledWith(currencies);
  });

  it('forwards nav unit type params to commonCodesService', async () => {
    const req = mockRequest({
      headers: { AzureAccessToken: 'azure-token', 'accept-language': 'en' },
    });
    const res = mockResponse();
    const navUnitTypes: EnhetstypeNorg[] = [{ kodenavn: 'LOKAL', term: 'Local' }];
    vi.mocked(commonCodesService.getNavUnitTypes).mockResolvedValueOnce(navUnitTypes);

    await commonCodes.getNavUnitTypes(req, res);

    expect(commonCodesService.getNavUnitTypes).toHaveBeenCalledWith({
      languageCode: 'en',
      accessToken: 'azure-token',
    });
    expect(res.send).toHaveBeenCalledWith(navUnitTypes);
  });

  it('forwards area code params to commonCodesService', async () => {
    const req = mockRequest({
      headers: { AzureAccessToken: 'azure-token' },
    });
    const res = mockResponse();
    const areaCodes = [{ label: '47 Norge', value: '47' }];
    vi.mocked(commonCodesService.getAreaCodes).mockResolvedValueOnce(areaCodes);

    await commonCodes.getAreaCodes(req, res);

    expect(commonCodesService.getAreaCodes).toHaveBeenCalledWith({
      accessToken: 'azure-token',
    });
    expect(res.send).toHaveBeenCalledWith(areaCodes);
  });
});
