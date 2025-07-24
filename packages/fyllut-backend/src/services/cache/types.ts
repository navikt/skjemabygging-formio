export type Cache = {
  set: (key: string, value: string, ttlSeconds: number) => Promise<'OK'>;
  get: (key: string) => Promise<string | null>;
  del: (key: string) => Promise<number>;
  isReady: () => boolean;
};

export const CacheId = {
  captcha: 'captcha',
} as const;
