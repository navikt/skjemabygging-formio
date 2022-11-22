export const unaryOperators = ["ex", "n_ex"];
export const operators = [...unaryOperators, "eq", "n_eq"] as const;
export type Operator = typeof operators[number];
