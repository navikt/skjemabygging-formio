import { config as appConfig } from '../../config/config';
import azureTokenHandler from '../../security/azureTokenHandler';
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
    azureSkjemabyggingProxy: azureTokenHandler(skjemabyggingProxyClientId!, 'AzureAccessToken'),
    azurePdl: azureTokenHandler(`${pdlTokenScopeCluster}.pdl.pdl-api`, 'AzureAccessToken'),
    kodeverkToken: azureTokenHandler(kodeverk.scope!, 'AzureAccessToken', true),
    tokenxSendInn: tokenxHandler(sendInnConfig?.tokenxClientId),
    tokenxPdl: tokenxHandler(`${pdlTokenScopeCluster}:pdl:pdl-api`),
    tokenxTilleggsstonader: tokenxHandler(tilleggsstonaderConfig.tokenxClientId),
    azurePdfGeneratorToken: azureTokenHandler(familiePdfGeneratorScope, 'PdfAccessToken'),
    azureMergePdfToken: azureTokenHandler(mergePdfScope, 'MergePdfToken'),
  };
};

export { initApiConfig };
