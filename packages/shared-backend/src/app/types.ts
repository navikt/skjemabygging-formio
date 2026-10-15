interface AppLogger {
  debug: (message: string) => unknown;
  info: (entry: object) => unknown;
  error: (entry: object) => unknown;
}

export type { AppLogger };
