import { fetchDecoratorHtml } from "@navikt/nav-dekoratoren-moduler/ssr";
import { config } from "./config/config";
import { NaisCluster } from "./config/nais-cluster.js";
import { logger } from "./logger.js";

const { naisClusterName } = config;

const getDecorator = async (redirect) => {
  /**
   * https://github.com/navikt/nav-dekoratoren
   */
  if (config.noDecorator) {
    logger.debug("Skipping decorator");
    return {};
  }
  return fetchDecoratorHtml({
    env: naisClusterName === NaisCluster.PROD ? "prod" : "dev",
    params: {
      redirectToUrl: redirect,
      level: "Level4",
      simple: true,
      urlLookupTable: false,
      logoutWarning: true,
    },
  });
};

const createRedirectUrl = (req, res) => {
  const formId = res.locals.formId;
  const baseUrl = `https://${req.get("host")}/fyllut`;
  if (formId) {
    return `${baseUrl}?form=${res.locals.formId}`;
  }
  return baseUrl;
};

export { getDecorator, createRedirectUrl };
