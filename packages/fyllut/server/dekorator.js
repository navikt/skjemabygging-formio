import { injectDecoratorServerSide } from "@navikt/nav-dekoratoren-moduler/ssr/index.js";
import { config } from "./config/config.js";

const { isDev } = config;

const getDecorator = async (filePath) => {
  /**
   * https://github.com/navikt/nav-dekoratoren
   */
  return injectDecoratorServerSide({
    env: isDev ? "dev" : "prod",
    filePath,
    simple: true,
  });
};

export default getDecorator;
