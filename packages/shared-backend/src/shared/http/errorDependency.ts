const dependencyByError = new WeakMap<object, string>();

const getHostname = (url: string | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname || undefined;
  } catch {
    return undefined;
  }
};

const recordErrorDependency = (error: unknown, hostname: string | undefined): void => {
  if (!hostname || typeof error !== 'object' || error === null || dependencyByError.has(error)) {
    return;
  }

  dependencyByError.set(error, hostname);
};

const getErrorDependency = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null ? dependencyByError.get(error) : undefined;

export { getErrorDependency, getHostname, recordErrorDependency };
