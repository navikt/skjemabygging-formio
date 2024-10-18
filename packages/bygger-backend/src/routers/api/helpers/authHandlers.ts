import appConfig from '../../../config';
import authorizedPublisher from './authorizedPublisher';
import azureOnBehalfOfTokenHandler from './azureOnBehalfOfTokenHandler';

const { naisClusterName } = appConfig;

const authHandlers = {
  authorizedPublisher,
  formsApiAuthHandler: azureOnBehalfOfTokenHandler(`${naisClusterName}.fyllut-sendinn.forms-api`),
};

export default authHandlers;
