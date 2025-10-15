import { Language, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

export const postNologinSoknad = async (
  appConfig: AppConfigContextType,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
  translation: any,
): Promise<Blob> => {
  const { http, baseUrl } = appConfig;
  return await http!.post<Blob>(
    `${baseUrl}/api/send-inn/nologin-soknad`,
    {
      form,
      submission,
      language,
      translation,
    },
    {
      NologinToken: nologinToken,
      Accept: http!.MimeType.PDF,
    },
  );
};
