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
  familiePdfDevToken,
  mergePdfScope,
  naisClusterName,
} = appConfig;

const initApiConfig = () => {
  return {
    azureM2MSkjemabyggingProxy: azureTokenHandler(skjemabyggingProxyClientId!, 'AzureAccessToken'),
    azureM2MPdl: azureTokenHandler(`${pdlTokenScopeCluster}.pdl.pdl-api`, 'AzureAccessToken'),
    azureM2MSendInn: azureTokenHandler(`${naisClusterName}.team-soknad.innsending-api`, 'AzureAccessToken', {
      token: sendInnConfig.devM2MToken,
    }),
    kodeverkToken: azureTokenHandler(kodeverk.scope!, 'AzureAccessToken', { skip: true }),
    tokenxSendInn: tokenxHandler(sendInnConfig?.tokenxClientId, {
      token: sendInnConfig.devOBOToken,
    }),
    tokenxPdl: tokenxHandler(`${pdlTokenScopeCluster}:pdl:pdl-api`),
    tokenxTilleggsstonader: tokenxHandler(tilleggsstonaderConfig.tokenxClientId),
    azurePdfGeneratorToken: azureTokenHandler(familiePdfGeneratorScope, 'PdfAccessToken', {
      token: familiePdfDevToken,
    }),
    azureMergePdfToken: azureTokenHandler(mergePdfScope, 'MergePdfToken'),
  };
};

export { initApiConfig };
