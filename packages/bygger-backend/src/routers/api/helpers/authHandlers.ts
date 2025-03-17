import appConfig from '../../../config';
import azureOnBehalfOfTokenHandler from './azureOnBehalfOfTokenHandler';

const { naisClusterName, formsApi } = appConfig;

const authHandlers = {
  formsApiAuthHandler: azureOnBehalfOfTokenHandler(`${naisClusterName}.fyllut-sendinn.forms-api`, formsApi.devToken),
};

export default authHandlers;
