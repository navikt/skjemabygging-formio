import formApiService from './formApiService';

interface GetFormsType {
  baseUrl: string;
}
const getForms = async (props: GetFormsType) => {
  return formApiService.getForms(props);
};

interface GetFormType {
  baseUrl: string;
  formPath: string;
}
const getForm = async (props: GetFormType) => {
  // TODO: Add support to get them from GitHub instead of the database
  return formApiService.getForm(props);
};

const formService = {
  getForms,
  getForm,
};

export default formService;
