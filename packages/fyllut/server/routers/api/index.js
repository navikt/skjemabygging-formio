import express from "express";
import azureAccessTokenHandler from "../../security/azureAccessTokenHandler.js";
import idportenAuthHandler from "../../security/idportenAuthHandler.js";
import config from "./config.js";
import countries from "./countries.js";
import enhetsliste from "./enhetsliste.js";
import foersteside from "./foersteside.js";
import form from "./form.js";
import forms from "./forms.js";
import globalTranslations from "./global-translations.js";
import mottaksadresser from "./mottaksadresser.js";
import pdf from "./pdf.js";
import translations from "./translations.js";

const apiRouter = express.Router();

apiRouter.all("*", idportenAuthHandler);
apiRouter.get("/config", config.get);
apiRouter.get("/countries", countries.get);
apiRouter.get("/enhetsliste", azureAccessTokenHandler, enhetsliste.get);
apiRouter.get("/forms", forms.get);
apiRouter.get("/forms/:formPath", form.get);
apiRouter.post("/foersteside", azureAccessTokenHandler, foersteside.post);
apiRouter.get("/global-translations/:languageCode", globalTranslations.get);
apiRouter.get("/translations/:form", translations.get);
apiRouter.get("/mottaksadresser", mottaksadresser.get);
apiRouter.post("/pdf-form", pdf["DIGITAL"].post);
apiRouter.post("/pdf-form-papir", pdf["PAPIR"].post);

export default apiRouter;
