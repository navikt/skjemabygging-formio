import config from '../config';

const { formio, prodFormio } = config;

export const getFormioApiServiceUrl = () => `${formio.apiService}/${formio.projectName}`;
export const getFormioApiProdServiceUrl = () => {
  if (prodFormio) {
    return `${prodFormio.apiService}/${prodFormio.projectName}`;
  }
  return undefined;
};
