import fs from 'fs';
import { fileLoader } from '../../../utils/file';

const formsDir = `${import.meta.dirname}/forms`;

export const loadForm = fileLoader(formsDir);

export const loadAllForms = () => {
  const fileNames = fs.readdirSync(formsDir);
  return Promise.all(fileNames.map((fileName) => loadForm(fileName.replace('.json', ''))));
};

export const loadTranslations = fileLoader(`${import.meta.dirname}/translations`);
