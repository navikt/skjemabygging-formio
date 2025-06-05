import { config as appConfig } from '../../config/config';
import azureAccessTokenHandler from '../../security/azureAccessTokenHandler';
import azurePdfAccessTokenHandler from '../../security/azurePdfAccessTokenHandler';
import tokenxHandler from '../../security/tokenxHandler';

const {
  kodeverk,
  sendInnConfig,
  skjemabyggingProxyClientId,
  pdlTokenScopeCluster,
  tilleggsstonaderConfig,
  familiePdfGeneratorScope,
} = appConfig;

const initApiConfig = () => {
  return {
    azureSkjemabyggingProxy: azureAccessTokenHandler(skjemabyggingProxyClientId!),
    azurePdl: azureAccessTokenHandler(`${pdlTokenScopeCluster}.pdl.pdl-api`),
    kodeverkToken: azureAccessTokenHandler(kodeverk.scope!, true),
    tokenxSendInn: tokenxHandler(sendInnConfig?.tokenxClientId),
    tokenxPdl: tokenxHandler(`${pdlTokenScopeCluster}:pdl:pdl-api`),
    tokenxTilleggsstonader: tokenxHandler(tilleggsstonaderConfig.tokenxClientId),
    azurePdfGeneratorToken: azurePdfAccessTokenHandler(familiePdfGeneratorScope),
  };
};

export { initApiConfig };
