import { Properties, PropertiesType } from './';
import { generateId, trimAndLowerCase } from './utils/dataUtils';

interface FormType {
  title: string;
  formNumber: string;
  path?: string;
  components?: any[];
  properties?: PropertiesType;
}

const form = ({ title, formNumber, path, components = [], properties }: FormType) => {
  return {
    tags: [],
    display: 'wizard',
    name: 'Søknad om førerhund',
    type: 'form',
    id: generateId(),
    skjemanummer: formNumber,
    path: path ?? trimAndLowerCase(formNumber),
    title,
    components,
    properties: properties ?? Properties({ formNumber }),
    createdAt: '2022-06-01T15:40:17.101+02',
    createdBy: 'Ola Nordmann',
    changedAt: '2025-08-29T13:45:27.833+02',
    changedBy: 'Ola Nordmann',
    status: 'draft',
  };
};

export default form;
export type { FormType };
