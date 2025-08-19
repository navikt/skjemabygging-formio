import { config as appConfig } from '../../config/config';
import nologinTokenHandler from '../../middleware/nologinTokenHandler';
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
  naisClusterName,
} = appConfig;

const initApiConfig = () => {
  return {
    azureM2MSkjemabyggingProxy: azureTokenHandler(skjemabyggingProxyClientId!, 'AzureAccessToken'),
    azureM2MPdl: azureTokenHandler(`${pdlTokenScopeCluster}.pdl.pdl-api`, 'AzureAccessToken'),
    azureM2MSendInn: azureTokenHandler(`${naisClusterName}.team-soknad.innsending-api`, 'AzureAccessToken', {
      token: sendInnConfig.devToken,
    }),
    kodeverkToken: azureTokenHandler(kodeverk.scope!, 'AzureAccessToken', { skip: true }),
    tokenxSendInn: tokenxHandler(sendInnConfig?.tokenxClientId),
    tokenxPdl: tokenxHandler(`${pdlTokenScopeCluster}:pdl:pdl-api`),
    tokenxTilleggsstonader: tokenxHandler(tilleggsstonaderConfig.tokenxClientId),
    azurePdfGeneratorToken: azureTokenHandler(familiePdfGeneratorScope, 'PdfAccessToken'),
    azureMergePdfToken: azureTokenHandler(mergePdfScope, 'MergePdfToken'),
    nologinTokenHandler,
  };
};

export { initApiConfig };
