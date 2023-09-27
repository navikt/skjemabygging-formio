const getUrlParam = (queryStr, name) => {
  const urlParams = new URLSearchParams(queryStr);
  const data = Object.fromEntries(urlParams);
  return data[name];
};

const getExitUrl = (url) => {
  return url.indexOf(".dev.nav.") > 0 ? "https://www.dev.nav.no" : "https://www.nav.no";
};

const url = {
  getUrlParam,
  getExitUrl,
};

export default url;
