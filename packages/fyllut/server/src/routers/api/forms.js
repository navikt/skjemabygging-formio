import { formService } from "../../services";

const mapForm = (form) => ({
  _id: form._id,
  title: form.title,
  path: form.path,
  modified: form.modified,
  properties: {
    skjemanummer: form.properties.skjemanummer,
  },
});

const forms = {
  get: async (req, res) => {
    const forms = await formService.loadForms();
    return res.json(forms.map(mapForm));
  },
};

export default forms;
