export const createRandomMathChallenge = (max: number = 10): MathChallenge => {
  const num1 = Math.floor(Math.random() * max) + 1;
  const num2 = Math.floor(Math.random() * max) + 1;
  const operator = Math.random() < 0.5 ? '+' : '-';

  // ensure subtraction does not result in negative numbers
  const a = operator === '+' ? num1 : Math.max(num1, num2);
  const b = operator === '+' ? num2 : Math.min(num1, num2);

  const expression = `${a} ${operator} ${b}`;
  const solution = String(operator === '+' ? a + b : a - b);

  return { expression, solution };
};

export type MathChallenge = { expression: string; solution: string };
