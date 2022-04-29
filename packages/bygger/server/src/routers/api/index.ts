import express from "express";
import config from "./config";
import enhetsliste from "./enhetsliste";
import apiErrorHandler from "./helpers/apiErrorHandler";
import authorizedPublisher from "./helpers/authorizedPublisher";
import migrate from "./migrate";
import migratePreview from "./migrate-preview";
import migrateUpdate from "./migrate-update";
import publishBulk from "./publish-bulk";
import publishForm from "./publish-form";
import publishResource from "./publish-resource";

const apiRouter = express.Router();

apiRouter.get("/config", config);
apiRouter.put("/publish/:formPath", authorizedPublisher, publishForm);
apiRouter.post("/publish-bulk", authorizedPublisher, publishBulk);
apiRouter.put("/published-resource/:resourceName", authorizedPublisher, publishResource);
apiRouter.get("/enhetsliste", enhetsliste);
apiRouter.get("/migrate", migrate);
apiRouter.get("/migrate/preview/:formPath", migratePreview);
apiRouter.post("/migrate/update", authorizedPublisher, migrateUpdate);

apiRouter.use(apiErrorHandler);

export default apiRouter;
