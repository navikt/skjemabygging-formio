export const unaryOperators = ["exists", "n_exists"];
export const operators = [...unaryOperators, "eq", "n_eq", "contains", "n_contains"] as const;
export type Operator = typeof operators[number];
