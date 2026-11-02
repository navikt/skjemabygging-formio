import { config } from '../config/config';

const isNewRenderForm = (formPath: string): boolean =>
  config.newRenderForms.includes('*') || config.newRenderForms.includes(formPath);

export { isNewRenderForm };
