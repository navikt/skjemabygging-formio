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
  return form.components
    .filter((component) => component.type === "panel")
    .map((attachment) => {
      return {
        label: attachment.label,
        key: attachment.key,
        description: attachment.description,
        attachmentTitle: attachment.vedleggstittel,
        attachmentCode: attachment.vedleggskode,
      };
    });
};

export default form;
