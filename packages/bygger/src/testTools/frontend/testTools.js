export const createJSONResponse = (json, initHash) => {
  if (!initHash) {
    initHash = { status: 200, statusText: "OK" };
  }
  const body = JSON.stringify(json); // avoid aliasing
  return {
    ok: initHash.status < 400,
    status: initHash.status,
    statusText: initHash.statusText,
    json: () => {
      return Promise.resolve(JSON.parse(body));
    },
    headers: new Map([['content-type', 'application/json']]),
    debugJsonBody: JSON.parse(body)
  };
};



