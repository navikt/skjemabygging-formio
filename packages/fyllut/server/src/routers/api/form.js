import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { config } from "../../config/config";
import { fetchFromFormioApi, loadFileFromDirectory } from "../../utils/forms.js";

const { useFormioApi, skjemaDir, formioProjectUrl } = config;

const loadForm = async (formPath) => {
  if (useFormioApi) {
    const forms = await fetchFromFormioApi(`${formioProjectUrl}/form?type=form&tags=nav-skjema&path=${formPath}`);
    return forms.length > 0 ? forms[0] : null;
  } else {
    return await loadFileFromDirectory(skjemaDir, formPath, null);
  }
};

const form = {
  get: async (req, res) => {
    const form = await loadForm(req.params.formPath);
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
        attachmentTitle: component.properties.vedleggstittel,
        attachmentCode: component.properties.vedleggskode,
      };
    });
};

export default form;
