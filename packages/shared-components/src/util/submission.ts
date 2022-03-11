export const getSubmissionMethod = (queryStr) => {
  const urlParams = new URLSearchParams(queryStr);
  const data = Object.fromEntries(urlParams);
  return data.sub;
}
