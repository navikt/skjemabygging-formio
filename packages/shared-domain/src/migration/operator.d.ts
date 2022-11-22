export const operators = ["eq", "n_eq", "ex", "n_ex"] as const;
export type Operator = typeof operators[number];
