import http from '../../shared/http/http';
import formClient from './formClient';

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

describe('formClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('forwards select when fetching forms', async () => {
    vi.mocked(http.get).mockResolvedValueOnce([]);

    await formClient.getForms({ baseUrl: 'http://forms-api', select: 'id,title' });

    expect(http.get).toHaveBeenCalledWith('http://forms-api/v1/forms?select=id%2Ctitle');
  });

  it('forwards select when fetching a form', async () => {
    vi.mocked(http.get).mockResolvedValueOnce({ path: 'nav123456' });

    await formClient.getForm({ baseUrl: 'http://forms-api', formPath: 'nav123456', select: 'title,properties' });

    expect(http.get).toHaveBeenCalledWith('http://forms-api/v1/forms/nav123456?select=title%2Cproperties');
  });

  it('omits select query when none is provided', async () => {
    vi.mocked(http.get).mockResolvedValueOnce({ path: 'nav123456' });

    await formClient.getForm({ baseUrl: 'http://forms-api', formPath: 'nav123456' });

    expect(http.get).toHaveBeenCalledWith('http://forms-api/v1/forms/nav123456');
  });
});
