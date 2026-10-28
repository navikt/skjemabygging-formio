import type { Request } from 'express';

const getRequestLogContext = (req: Request): Record<string, unknown> => ({ method: req.method, path: req.path });

export { getRequestLogContext };
