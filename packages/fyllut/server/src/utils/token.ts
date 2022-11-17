const getTokenxAccessToken = (req: any) => {
  const tokenxAccessToken = req.getTokenxAccessToken ? req.getTokenxAccessToken() : null;
  if (!tokenxAccessToken) {
    throw new Error("Missing TokenX access token");
  }
  return tokenxAccessToken;
};

export { getTokenxAccessToken };
