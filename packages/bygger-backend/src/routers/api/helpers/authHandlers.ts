import appConfig from '../../../config';
import authorizedPublisher from './authorizedPublisher';
import azureOnBehalfOfTokenHandler from './azureOnBehalfOfTokenHandler';

const { naisClusterName, formsApi } = appConfig;

const authHandlers = {
  authorizedPublisher,
  formsApiAuthHandler: azureOnBehalfOfTokenHandler(`${naisClusterName}.fyllut-sendinn.forms-api`, formsApi.devToken),
};

export default authHandlers;
