import app from "./app.js";
import "./config/verifyConfig.js";
import { logger } from "./logger.js";
import "./utils/errorToJson.js";
import "./utils/initDotenv.js";

const port = parseInt(process.env.PORT || "8080");

logger.info(`serving on ${port}`);
app.listen(port);

//Play nice with nais, force node to delay quiting to ensure no traffic is incoming
process.on("SIGTERM", () => setTimeout(() => logger.debug("Har sovet i 30 sekunder"), 30000));
