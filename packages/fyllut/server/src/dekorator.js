import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";
import { config } from "./config/config.js";
import { NaisCluster } from "./config/nais-cluster.js";

const { naisClusterName } = config;

const getDecorator = async (filePath, redirect) => {
  /**
   * https://github.com/navikt/nav-dekoratoren
   */
  return injectDecoratorServerSide({
    env: naisClusterName === NaisCluster.PROD ? "prod" : "dev",
    filePath,
    redirectToUrl: redirect,
    level: "Level4",
    simple: true,
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
