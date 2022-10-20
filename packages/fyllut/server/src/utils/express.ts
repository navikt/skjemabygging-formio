import { ParsedQs } from "qs";

export const excludeQueryParam = (name: string, query: ParsedQs = {}): { [key: string]: any } => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [name]: excluded, ...rest } = query;
  return rest;
};
