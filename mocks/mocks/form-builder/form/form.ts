import { generateId, trimAndLowerCase } from '../shared/utils';
import formIntroPage, { FormIntroPageType } from './formIntroPage';
import formProperties, { FormPropertiesType } from './formProperties';

export interface FormType {
  title: string;
  formNumber: string;
  components: any[];
  path?: string;
  properties?: FormPropertiesType;
  introPage?: FormIntroPageType;
}

const form = (props: FormType) => {
  const { title, formNumber, components, path, properties, introPage } = props ?? {};

  return {
    ...staticDefaultValues,
    id: generateId(),
    skjemanummer: formNumber,
    title,
    path: path ?? trimAndLowerCase(formNumber),
    name: trimAndLowerCase(formNumber),
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
