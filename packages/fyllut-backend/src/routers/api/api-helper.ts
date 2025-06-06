import { config as appConfig } from '../../config/config';
import azureAccessTokenHandler from '../../security/azureAccessTokenHandler';
import azureMergePdfAccessTokenHandler from '../../security/azureMergePdfAccessTokenHandler';
import azurePdfAccessTokenHandler from '../../security/azurePdfAccessTokenHandler';
import tokenxHandler from '../../security/tokenxHandler';

const {
  kodeverk,
  sendInnConfig,
  skjemabyggingProxyClientId,
  pdlTokenScopeCluster,
  tilleggsstonaderConfig,
  familiePdfGeneratorScope,
  mergePdfScope,
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
    azureMergePdfToken: azureMergePdfAccessTokenHandler(mergePdfScope),
  };
};

export { initApiConfig };
