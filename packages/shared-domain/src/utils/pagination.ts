const retrieveRangeOfList = <Item>(list: Array<Item>, page: number, maxPerPage: number): Array<Item> => {
  const start = (page - 1) * maxPerPage;
  return list.slice(start, start + maxPerPage);
};

const paginationUtils = {
  retrieveRangeOfList,
};
export default paginationUtils;
