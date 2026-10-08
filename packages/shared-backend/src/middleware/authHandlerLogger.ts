type AuthHandlerLogContext = Record<string, unknown>;

interface AuthHandlerLogger {
  debug: (message: string, context?: AuthHandlerLogContext) => void;
  info: (message: string, context?: AuthHandlerLogContext) => void;
  warn: (message: string, context?: AuthHandlerLogContext) => void;
}

export type { AuthHandlerLogger };
