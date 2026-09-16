import { Request, Response } from 'express';
import { mock } from 'vitest-mock-extended';
import { reportService } from '../../../services';
import { deferred } from '../../../services/reports/testHelpers';
import { ApiError } from '../helpers/errors';
import report from './report';

vi.mock('../../../services', () => ({
  reportService: { getReportDefinition: vi.fn(), generate: vi.fn() },
}));

describe('Report download route', () => {
  beforeEach(() => {
    vi.mocked(reportService.getReportDefinition).mockReturnValue({
      id: 'all-forms-summary',
      title: 'Summary',
      contentType: 'text/csv',
      fileEnding: 'csv',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('preserves download headers and waits for generation', async () => {
    const generated = deferred();
    vi.mocked(reportService.generate).mockReturnValue(generated.promise);
    const req = mock<Request>({ params: { reportId: 'all-forms-summary' } });
    const res = mock<Response>();
    const next = vi.fn();
    let complete = false;
    const completion = Promise.resolve(report(req, res, next)).then(() => {
      complete = true;
    });
    await Promise.resolve();
    expect(complete).toBe(false);
    expect(res.contentType).toHaveBeenCalledWith('text/csv; charset=utf-8');
    expect(res.attachment).toHaveBeenCalledWith('all-forms-summary.csv');
    expect(reportService.generate).toHaveBeenCalledWith('all-forms-summary', res);
    generated.resolve();
    await completion;
    expect(next).not.toHaveBeenCalled();
  });

  it('passes pre-stream failures to the existing error handler', async () => {
    vi.mocked(reportService.generate).mockRejectedValue(new Error('failure'));
    const next = vi.fn();
    await report(
      mock<Request>({ params: { reportId: 'all-forms-summary' } }),
      mock<Response>({ headersSent: false, destroyed: false }),
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it.each([
    [true, false],
    [true, true],
    [false, true],
  ])(
    'does not append JSON after a started or destroyed stream (headers %s, destroyed %s)',
    async (headersSent, destroyed) => {
      vi.mocked(reportService.generate).mockRejectedValue(new Error('failure'));
      const res = mock<Response>({ headersSent, destroyed });
      const next = vi.fn();
      await report(mock<Request>({ params: { reportId: 'all-forms-summary' } }), res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(res.destroy).toHaveBeenCalledTimes(destroyed ? 0 : 1);
    },
  );
});
