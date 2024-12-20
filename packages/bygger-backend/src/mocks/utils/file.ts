import { logger } from '../../logging/logger';

export const fileLoader =
  (path: string) =>
  async (name: string, extension: string = 'json') => {
    const filePath = `${path}/${name}.${extension}`;
    logger.info(`[MSW] Loading ${filePath}`);
    const { default: data } =
      (await import(/* @vite-ignore */ filePath, {
        assert: { type: extension },
      }).catch(() => {})) || {};
    return data;
  };
