import { ParsedQs } from 'qs';

export const excludeQueryParam = (paramToExclude: string, query: ParsedQs = {}): { [key: string]: any } => {
  const queryCopy = { ...query };
  delete queryCopy[paramToExclude];
  return queryCopy;
};
