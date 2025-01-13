import fs from 'fs';
import { fileLoader, mocksBaseDir } from '../../../utils/file';

const formsDir = `api/formio/data/forms`;

export const loadForm = fileLoader(formsDir);

export const loadAllForms = () => {
  const fileNames = fs.readdirSync(mocksBaseDir);
  return Promise.all(fileNames.map((fileName) => loadForm(fileName.replace('.json', ''))));
};

export const loadTranslations = fileLoader(`api/formio/data/translations`);
