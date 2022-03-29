import { config } from "../config/config.js";
import { logger } from "../logger.js";
import TokenXClient from "./tokenxClient.js";

const { isDevelopment } = config;

const { instance: tokenx } = TokenXClient;

const tokenxHandler = (targetClientId) => async (req, res, next) => {
  try {
    let tokenxAccessToken;
    if (isDevelopment) {
      logger.debug("Mocking TokenX access token");
      tokenxAccessToken = "mocked-tokenx-access-token"; // TODO how to get TokenX access token for development?
    } else {
      tokenxAccessToken = await tokenx.exchangeToken(req.getIdportenJwt(), targetClientId);
    }
    req.getTokenxAccessToken = () => tokenxAccessToken;
  } catch (err) {
    next(err);
  }
  next();
};

export default tokenxHandler;
