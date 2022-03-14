const getUrlParam = (queryStr, name) => {
  const urlParams = new URLSearchParams(queryStr);
  const data = Object.fromEntries(urlParams);
  return data[name];
}

const url = {
  getUrlParam,
}

export default url;

