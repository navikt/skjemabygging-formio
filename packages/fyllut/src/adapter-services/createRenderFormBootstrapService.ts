import { formUtils } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormsApiTranslationMap, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutHttp } from '@navikt/skjemadigitalisering-shared-frontend';

interface RenderFormBootstrap {
  form: Form;
  translations: FormsApiTranslationMap;
}

interface RenderFormBootstrapService {
  load: (formPath: string) => Promise<RenderFormBootstrap | undefined>;
  getPrefillData: (properties: string[]) => Promise<SubmissionData>;
}

interface Props {
  http: Pick<FyllutHttp, 'get'>;
  backendBaseUrl: string;
}

const formSelect = 'title,skjemanummer,path,revision,introPage,components,properties,publishedLanguages,firstPanelSlug';

const createRenderFormBootstrapService = ({ http, backendBaseUrl }: Props): RenderFormBootstrapService => ({
  load: async (formPath) => {
    const [form, translations] = await Promise.all([
      http.get<Form>(`${backendBaseUrl}/api/forms/${formPath}?select=${formSelect}`),
      http.get<FormsApiTranslationMap>(`${backendBaseUrl}/api/forms/${formPath}/translations`),
    ]);

    if (!form || !translations) {
      return undefined;
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
