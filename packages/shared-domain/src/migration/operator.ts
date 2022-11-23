export const unaryOperators = ["exists", "n_exists"];
export const operators = [...unaryOperators, "eq", "n_eq"] as const;
export type Operator = typeof operators[number];
