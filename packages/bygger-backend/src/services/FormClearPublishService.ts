import { Backend } from '../Backend';
import { logger } from '../logging/logger';

type CleanupResult = { removed: string[]; failed: { path: string; error: string }[] };

const createFormClearPublishService = (backend: Pick<Backend, 'listPublishedFormPaths' | 'unpublishForm'>) => ({
  cleanup: async (existingPaths: string[]): Promise<CleanupResult> => {
    const existing = new Set(existingPaths);
    const orphaned = (await backend.listPublishedFormPaths()).filter((path) => !existing.has(path));
    const result: CleanupResult = { removed: [], failed: [] };
    for (const path of orphaned) {
      try {
        await backend.unpublishForm(path);
        result.removed.push(path);
      } catch {
        logger.error('Failed to remove orphaned publish artifacts', { path });
        result.failed.push({ path, error: 'Could not remove published artifacts' });
      }
    }
    return result;
  },
});

export { createFormClearPublishService };
