import { ComponentResolver } from '../../types';

type ComponentRegistry = Partial<Record<string, ComponentResolver>>;

export type { ComponentRegistry };
