import type { Request } from 'express';

type AuthHandlerLogContext = Record<string, unknown>;

interface AuthHandlerLogger {
  debug: (message: string, context?: AuthHandlerLogContext) => void;
  info: (message: string, context?: AuthHandlerLogContext) => void;
  warn: (message: string, context?: AuthHandlerLogContext) => void;
}

const getRequestLogContext = (req: Request): AuthHandlerLogContext => ({ method: req.method, path: req.path });

export { getRequestLogContext };
export type { AuthHandlerLogger };
