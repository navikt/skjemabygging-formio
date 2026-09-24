import { formUtils } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormsApiTranslationMap, hasErrorCode, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import { IntegrationHttp } from '@navikt/skjemadigitalisering-shared-frontend';

interface RenderFormBootstrap {
  form: Form;
  translations: FormsApiTranslationMap;
}

interface RenderFormBootstrapService {
  load: (formPath: string) => Promise<RenderFormBootstrap | undefined>;
  getPrefillData: (properties: string[]) => Promise<SubmissionData>;
}

interface Props {
  http: Pick<IntegrationHttp, 'get'>;
  backendBaseUrl: string;
}

const formSelect = 'title,skjemanummer,path,revision,introPage,components,properties,publishedLanguages,firstPanelSlug';

const createRenderFormBootstrapService = ({ http, backendBaseUrl }: Props): RenderFormBootstrapService => ({
  load: async (formPath) => {
    const form = await http
      .get<Form>(`${backendBaseUrl}/api/forms/${formPath}?select=${formSelect}`)
      .then((form) => {
        if (!form) {
          throw new Error('Form response is missing.');
        }
        return form;
      })
      .catch((error: unknown) => {
        if (hasErrorCode(error, 'NOT_FOUND')) {
          return undefined;
        }
        throw error;
      });

    if (!form) {
      return undefined;
    }

    const translations = await http.get<FormsApiTranslationMap>(`${backendBaseUrl}/api/forms/${formPath}/translations`);
    if (!translations) {
      throw new Error('Form translations response is missing.');
    }

    return {
      form: {
        ...form,
        firstPanelSlug: formUtils.getPanelSlug(form, 0),
      },
      translations,
    };
  },
  getPrefillData: (properties) =>
    http.get<SubmissionData>(`${backendBaseUrl}/api/send-inn/prefill-data?properties=${properties.join(',')}`),
});

export default createRenderFormBootstrapService;
export type { RenderFormBootstrap, RenderFormBootstrapService };
