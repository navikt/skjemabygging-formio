import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { formService, translationsService } from "../../services";

const form = {
  get: async (req, res) => {
    const { type, lang } = req.query;
    const form = await formService.loadForm(req.params.formPath);
    if (!form || !form.properties) {
      return res.sendStatus(404);
    }
    if (type === "limited") {
      let t = (text) => text;
      if (lang && lang !== "nb") {
        const translations = await translationsService.getTranslationsForLanguage(form.path, lang);
        t = (text) => translations[text] ?? text;
      }
      return res.json(mapLimitedForm(form, t));
    }
    return res.json(form);
  },
};

const mapLimitedForm = (form, t) => {
  return {
    _id: form._id,
    title: t(form.title),
    path: form.path,
    modified: form.modified,
    properties: {
      skjemanummer: form.properties.skjemanummer,
      tema: form.properties.tema,
      innsending: form.properties.innsending,
      ettersending: form.properties.ettersending,
      enhetstyper: form.properties.enhetstyper,
      enhetMaVelgesVedPapirInnsending: form.properties.enhetMaVelgesVedPapirInnsending,
    },
    attachments: getAttachments(form, t),
  };
};

const getAttachments = (form, t) => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => !!component.properties?.vedleggskode)
    .map((component) => {
      return {
        label: t(component.label),
        key: component.key,
        description: t(component.description),
        otherDocumentation: component.otherDocumentation,
        attachmentTitle: t(component.properties.vedleggstittel),
        attachmentCode: component.properties.vedleggskode,
      };
    });
};

export default form;
