import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { FyllutAppConfig, RenderForm, RenderFormProps } from '@navikt/skjemadigitalisering-shared-frontend';

type Props = Omit<RenderFormProps, 'fyllutAppConfig' | 'fyllutLanguage'>;

const RenderFormAdapter = (props: Props) => {
  const appConfig = useAppConfig();
  const { availableLanguages, currentLanguage, translate } = useLanguages();
  const downloadPdf = appConfig.http
    ? (url: string, body: object) =>
        appConfig.http!.post<Blob>(url, body, {
          Accept: appConfig.http!.MimeType.PDF,
        })
    : undefined;
  const fyllutAppConfig: FyllutAppConfig = { ...appConfig, downloadPdf };

  return (
    <RenderForm
      {...props}
      fyllutAppConfig={fyllutAppConfig}
      fyllutLanguage={{ availableLanguages, currentLanguage, translate }}
    />
  );
};

export default RenderFormAdapter;
