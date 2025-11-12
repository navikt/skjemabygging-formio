import { properties as createProperties, PropertiesType } from './index';
import { generateId, trimAndLowerCase } from './shared/dataUtils';

export interface FormType {
  title: string;
  formNumber: string;
  components: any[];
  path?: string;
  properties?: PropertiesType;
}

const form = (params: FormType) => {
  const { title, formNumber, components, path, properties } = params ?? {};

  return {
    ...staticValues,
    id: generateId(),
    skjemanummer: formNumber,
    title,
    path: path ?? trimAndLowerCase(formNumber),
    name: trimAndLowerCase(formNumber),
    components,
    properties: properties ?? createProperties({ formNumber }),
  };
};

const staticValues = {
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
