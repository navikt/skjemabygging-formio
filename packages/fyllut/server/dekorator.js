import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";
import { config } from "./config/config.js";
import { NaisCluster } from "./config/nais-cluster.js";

const { naisClusterName } = config;

const getDecorator = async (filePath) => {
  /**
   * https://github.com/navikt/nav-dekoratoren
   */
  return injectDecoratorServerSide({
    env: naisClusterName === NaisCluster.DEV ? "dev" : "prod",
    redirectToApp: true,
    filePath,
    simple: true,
  });
};

export default getDecorator;
