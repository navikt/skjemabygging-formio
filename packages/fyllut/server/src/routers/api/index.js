import express from "express";
import { config as appConfig } from "../../config/config";
import { rateLimiter } from "../../middleware/ratelimit";
import azureAccessTokenHandler from "../../security/azureAccessTokenHandler.js";
import idportenAuthHandler from "../../security/idportenAuthHandler";
import tokenxHandler from "../../security/tokenxHandler.js";
import commonCodes from "./common-codes";
import config from "./config.js";
import countries from "./countries.js";
import enhetsliste from "./enhetsliste.js";
import exstream from "./exstream";
import form from "./form.js";
import forms from "./forms.js";
import forsteside from "./forsteside";
import globalTranslations from "./global-translations.js";
import log from "./log";
import mottaksadresser from "./mottaksadresser.js";
import pdf from "./pdf.js";
import pdl from "./pdl";
import sendInn from "./send-inn.js";
import translations from "./translations.js";

const { sendInnConfig } = appConfig;

const apiRouter = express.Router();

apiRouter.all("*", idportenAuthHandler);
apiRouter.get("/config", config.get);
apiRouter.get("/countries", countries.get);
apiRouter.get("/enhetsliste", azureAccessTokenHandler, enhetsliste.get);
apiRouter.get("/forms", forms.get);
apiRouter.get("/forms/:formPath", form.get);
apiRouter.post("/foersteside", azureAccessTokenHandler, forsteside.post);
apiRouter.get("/global-translations/:languageCode", globalTranslations.get);
apiRouter.get("/translations/:form", translations.get);
apiRouter.get("/mottaksadresser", mottaksadresser.get);
apiRouter.post("/send-inn", tokenxHandler(sendInnConfig.tokenxClientId), sendInn.post);
apiRouter.post("/pdf-form", pdf["DIGITAL"].post);
apiRouter.post("/pdf-form-papir", pdf["PAPIR"].post);
apiRouter.get("/common-codes/archive-subjects", azureAccessTokenHandler, commonCodes.getArchiveSubjects);
apiRouter.get("/pdf/convert", azureAccessTokenHandler, exstream.get);
apiRouter.get("/common-codes/currencies", azureAccessTokenHandler, commonCodes.getCurrencies);
apiRouter.get("/pdl/person/:id", tokenxHandler("dev-fss:pdl:pdl-api"), pdl.person);
apiRouter.get("/pdl/children/:id", tokenxHandler("dev-fss:pdl:pdl-api"), pdl.children);
apiRouter.post("/log/:level", rateLimiter(60000, 60), log.post);

export default apiRouter;
