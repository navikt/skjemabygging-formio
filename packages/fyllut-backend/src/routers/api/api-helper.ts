import { config as appConfig } from '../../config/config';
import azureAccessTokenHandler from '../../security/azureAccessTokenHandler';
import tokenxHandler from '../../security/tokenxHandler';

const { kodeverk, sendInnConfig, skjemabyggingProxyClientId, pdlTokenScopeCluster } = appConfig;

const initApiConfig = () => {
  return {
    azureSkjemabyggingProxy: azureAccessTokenHandler(skjemabyggingProxyClientId!),
    azurePdl: azureAccessTokenHandler(`${pdlTokenScopeCluster}.pdl.pdl-api`),
    kodeverkToken: azureAccessTokenHandler(kodeverk.scope!, true),
    tokenxSendInn: tokenxHandler(sendInnConfig?.tokenxClientId),
    tokenxPdl: tokenxHandler(`${pdlTokenScopeCluster}:pdl:pdl-api`),
  };
};

export { initApiConfig };
