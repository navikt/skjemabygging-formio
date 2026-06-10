import { Form, FormsResponseForm, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { formService } from '../../../services';

type FormsListItem = Pick<Form, 'id' | 'path' | 'skjemanummer' | 'title' | 'changedAt' | 'properties' | 'publishedAt'> &
  Partial<Pick<NavFormType, '_id' | 'modified'>>;

const mapForm = (form: FormsListItem): FormsResponseForm => ({
  _id: form.id ? String(form.id) : form._id,
  title: form.title,
  path: form.path,
  modified: form.publishedAt ?? form.changedAt ?? form.modified,
  properties: {
    skjemanummer: form.skjemanummer ?? form.properties?.skjemanummer,
    submissionTypes: form.properties?.submissionTypes,
    subsequentSubmissionTypes: form.properties?.subsequentSubmissionTypes,
  },
});

const forms = {
  get: async (_req: Request, res: Response<FormsResponseForm[]>) => {
    const forms = await formService.getForms({
      select: ['id', 'path', 'skjemanummer', 'title', 'changedAt', 'properties', 'publishedAt'],
    });

    return res.json(forms.map(mapForm));
  },
};

export default forms;
