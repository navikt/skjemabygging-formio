import { registerDataService } from '../../../services';
import { mockRequest, mockResponse } from '../../../test/testHelpers';

vi.mock('../../../services', () => ({
  registerDataService: {
    getActivities: vi.fn(),
  },
}));

import activities from './activities';

describe('[endpoint] register-data/activities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards token and query to registerDataService', async () => {
    const result = [{ value: 'A1', label: 'Aktivitet 1', type: 'TILTAK' }];
    vi.mocked(registerDataService.getActivities).mockResolvedValueOnce(result);

    const req = mockRequest({
      query: {
        dagligreise: 'true',
      },
    });
    req.getTokenxAccessToken = () => 'tokenx-token';
    const res = mockResponse();

    await activities.get(req, res);

    expect(registerDataService.getActivities).toHaveBeenCalledWith({
      accessToken: 'tokenx-token',
      query: {
        dagligreise: 'true',
      },
    });
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
