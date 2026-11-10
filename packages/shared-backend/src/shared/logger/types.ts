import type { Logger as WinstonLogger } from 'winston';

type Logger = Pick<WinstonLogger, 'debug' | 'info' | 'warn' | 'error'>;

export type { Logger };
