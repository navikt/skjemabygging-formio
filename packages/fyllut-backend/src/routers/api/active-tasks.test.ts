import { activeTaskService } from '../../services';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import activeTasks from './active-tasks';

describe('[endpoint] active-tasks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns active tasks from the shared service', async () => {
    const tasks = [
      {
        skjemanr: 'NAV123',
        innsendingsId: 'id-1',
        endretDato: '2024-01-01',
        soknadstype: 'soknad' as const,
      },
    ];
    vi.spyOn(activeTaskService, 'getActiveTasks').mockResolvedValue(tasks);

    const req = mockRequest({ params: { skjemanummer: 'NAV123' } });
    req.getTokenxAccessToken = () => 'tokenx-access-token';
    const res = mockResponse();
    const next = vi.fn();

    await activeTasks.get(req, res, next);

    expect(activeTaskService.getActiveTasks).toHaveBeenCalledWith({
      accessToken: 'tokenx-access-token',
      skjemanummer: 'NAV123',
    });
    expect(res.json).toHaveBeenCalledWith(tasks);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes service failures to next', async () => {
    const error = new Error('boom');
    vi.spyOn(activeTaskService, 'getActiveTasks').mockRejectedValue(error);

    const req = mockRequest({ params: { skjemanummer: 'NAV123' } });
    req.getTokenxAccessToken = () => 'tokenx-access-token';
    const res = mockResponse();
    const next = vi.fn();

    await activeTasks.get(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
