import { generateId, sanitizeAndLowerCase } from '../shared/utils';
import formIntroPage, { FormIntroPageType } from './formIntroPage';
import formProperties from './formProperties';

export interface FormType {
  title: string;
  formNumber: string;
  path: string;
  components: any[];
  properties?: any;
  introPage?: FormIntroPageType;
}

const form = (props: FormType) => {
  const { title, formNumber, components, path, properties, introPage } = props ?? {};

  return {
    ...staticDefaultValues,
    id: generateId(),
    title,
    skjemanummer: formNumber,
    path,
    name: sanitizeAndLowerCase(formNumber),
    components,
    properties: properties ?? formProperties({ formNumber }),
    introPage: introPage ?? formIntroPage(),
  };
};

const staticDefaultValues = {
  tags: [],
  display: 'wizard',
  type: 'form',
  createdAt: '2022-06-01T15:40:17.101+02',
  createdBy: 'Ola Nordmann',
  changedAt: '2025-08-29T13:45:27.833+02',
  changedBy: 'Ola Nordmann',
  status: 'draft',
};

export default form;
