import { ParsedQs } from "qs";

export const excludeQueryParam = (name: string, query: ParsedQs = {}): { [key: string]: any } => {
  const rest = { ...query };
  delete rest[name];
  return rest;
};
