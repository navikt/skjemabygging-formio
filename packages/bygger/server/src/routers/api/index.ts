import express from "express";
import config from "./config";
import deprecatedPublishBulk from "./deprecated-publish-bulk";
import deprecatedPublishForm from "./deprecated-publish-form";
import deprecatedUnpublishForm from "./deprecated-unpublish-form";
import enhetsliste from "./enhetsliste";
import formDiff from "./formDiff";
import apiErrorHandler from "./helpers/apiErrorHandler";
import authorizedPublisher from "./helpers/authorizedPublisher";
import migrate from "./migrate";
import migratePreview from "./migrate-preview";
import migrateUpdate from "./migrate-update";
import publishForm from "./publish-form";
import publishForms from "./publish-forms";
import publishResource from "./publish-resource";
import unpublishForm from "./unpublish-form";

const apiRouter = express.Router();

apiRouter.get("/config", config);
apiRouter.put("/publish/:formPath", authorizedPublisher, deprecatedPublishForm);
apiRouter.delete("/publish/:formPath", authorizedPublisher, deprecatedUnpublishForm);
apiRouter.put("/published-forms/:formPath", authorizedPublisher, publishForm);
apiRouter.delete("/published-forms/:formPath", authorizedPublisher, unpublishForm);
apiRouter.post("/published-forms", authorizedPublisher, publishForms);
apiRouter.post("/publish-bulk", authorizedPublisher, deprecatedPublishBulk);
apiRouter.put("/published-resource/:resourceName", authorizedPublisher, publishResource);
apiRouter.get("/enhetsliste", enhetsliste);
apiRouter.get("/migrate", migrate);
apiRouter.get("/migrate/preview/:formPath", migratePreview);
apiRouter.post("/migrate/update", authorizedPublisher, migrateUpdate);
apiRouter.get("/form/:formPath/diff", formDiff);

apiRouter.use(apiErrorHandler);

export default apiRouter;
