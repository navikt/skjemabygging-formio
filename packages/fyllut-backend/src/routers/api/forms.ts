import { Request, Response } from 'express';
import { FormsResponseForm } from '../../../../shared-domain/src/form';
import { formService } from '../../services';

const mapForm = (form): FormsResponseForm => ({
  _id: form.id ? String(form.id) : form._id,
  title: form.title,
  path: form.path,
  modified: form.publishedAt ?? form.modified,
  properties: {
    skjemanummer: form.skjemanummer ?? form.properties.skjemanummer,
    submissionTypes: form.properties.submissionTypes,
    ettersending: form.properties.ettersending,
  },
});

const forms = {
  get: async (req: Request, res: Response<FormsResponseForm[]>) => {
    const forms = await formService.loadForms();
    return res.json(forms.map(mapForm));
  },
};

export default forms;
