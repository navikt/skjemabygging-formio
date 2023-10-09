export const unaryOperators: readonly Operator[] = ['exists', 'n_exists'] as const;
export const operators = ['exists', 'n_exists', 'eq', 'n_eq', 'contains', 'n_contains'] as const;
export type Operator = (typeof operators)[number];
