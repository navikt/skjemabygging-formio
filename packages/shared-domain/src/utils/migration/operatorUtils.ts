import { Operator, operators, unaryOperators } from './operator';

export const isUnaryOperator = (operator: Operator) => unaryOperators.includes(operator);
const isValidOperator = (operator: any): operator is Operator => operators.includes(operator);

export const combinePropAndOperator = (prop: string, operator: Operator | undefined) => {
  if (operator === undefined || operator === 'eq' || !isValidOperator(operator)) return prop;
  return `${prop}__${operator}`;
};

export const getPropAndOperatorFromKey = (key: string): [string, Operator | undefined] => {
  const [prop, operatorCandidate] = key.split('__');
  if (operatorCandidate && isValidOperator(operatorCandidate) && operatorCandidate !== 'eq') {
    return [prop, operatorCandidate as Operator];
  }
  return [prop, undefined];
};
