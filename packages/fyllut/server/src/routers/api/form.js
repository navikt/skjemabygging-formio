import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { formService } from "../../services";

const form = {
  get: async (req, res) => {
    const form = await formService.loadForm(req.params.formPath);
    if (!form) {
      return res.sendStatus(404);
    }
    if (req.query.type === "limited") {
      return res.json(mapLimitedForm(form));
    }
    return res.json(form);
  },
};

const mapLimitedForm = (form) => {
  return {
    _id: form._id,
    title: form.title,
    path: form.path,
    modified: form.modified,
    properties: {
      skjemanummer: form.properties.skjemanummer,
      tema: form.properties.tema,
      innsending: form.properties.innsending,
      enhetstyper: form.properties.enhetstyper,
      enhetMaVelgesVedPapirInnsending: form.properties.enhetMaVelgesVedPapirInnsending,
    },
    attachments: getAttachments(form),
  };
};

const getAttachments = (form) => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => !!component.properties?.vedleggskode)
    .map((component) => {
      return {
        label: component.label,
        key: component.key,
        description: component.description,
        otherDocumentation: component.otherDocumentation,
        attachmentTitle: component.properties.vedleggstittel,
        attachmentCode: component.properties.vedleggskode,
      };
    });
};

export default form;
