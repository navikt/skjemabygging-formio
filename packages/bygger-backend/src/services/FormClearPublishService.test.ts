import { describe, expect, it, vi } from 'vitest';
import { createFormClearPublishService } from './FormClearPublishService';

describe('publish cleanup', () => {
  it('derives orphans on every call, leaving kept paths untouched and reporting individual failures', async () => {
    const backend = {
      listPublishedFormPaths: vi
        .fn()
        .mockResolvedValueOnce(['nested/old', 'kept', 'failed'])
        .mockResolvedValueOnce(['kept', 'failed']),
      unpublishForm: vi.fn().mockImplementation(async (path: string) => {
        if (path === 'failed') throw new Error('GitHub unavailable');
      }),
    };
    const service = createFormClearPublishService(backend);
    await expect(service.cleanup(['kept'])).resolves.toEqual({
      removed: ['nested/old'],
      failed: [{ path: 'failed', error: 'Could not remove published artifacts' }],
    });
    await expect(service.cleanup(['kept'])).resolves.toEqual({
      removed: [],
      failed: [{ path: 'failed', error: 'Could not remove published artifacts' }],
    });
    expect(backend.unpublishForm).not.toHaveBeenCalledWith('kept');
  });

  it('does not delete anything when listing artifacts fails', async () => {
    const backend = {
      listPublishedFormPaths: vi.fn().mockRejectedValue(new Error('Tree truncated')),
      unpublishForm: vi.fn(),
    };
    await expect(createFormClearPublishService(backend).cleanup([])).rejects.toThrow('Tree truncated');
    expect(backend.unpublishForm).not.toHaveBeenCalled();
  });

  it('preserves published artifacts for an existing soft-deleted form kept by path', async () => {
    const backend = {
      listPublishedFormPaths: vi.fn().mockResolvedValue(['soft-deleted/kept', 'removed/old']),
      unpublishForm: vi.fn().mockResolvedValue(undefined),
    };
    await expect(createFormClearPublishService(backend).cleanup(['soft-deleted/kept'])).resolves.toEqual({
      removed: ['removed/old'],
      failed: [],
    });
    expect(backend.unpublishForm).toHaveBeenCalledExactlyOnceWith('removed/old');
  });
});
