import { attachment, panel, radio } from '../../form-builder/components';
import yourInformation from '../../form-builder/components/cutomized/yourInformation';
import form from '../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../form-builder/shared/utils';

const defaultProps = { validate: { required: true } };

const nologinForm = () => {
  const formNumber = 'Nologin 001';
  const formPath = 'nologin001';

  return form({
    title: 'Nologin test form',
    formNumber: formNumber,
    path: formPath,
    components: [
      panel({
        title: 'Dine opplysninger',
        key: 'dineOpplysninger',
        components: [yourInformation({ key: 'dineOpplysningerContainer' })],
      }),
      panel({
        title: 'Utdanning',
        components: [
          radio({
            label: 'Høyeste fullførte utdanning',
            key: 'hoyesteFullforteUtdanning',
            values: [
              { label: 'Grunnskole', value: 'grunnskole' },
              { label: 'Videregående', value: 'videregaende' },
              { label: 'Universitet eller høgskole', value: 'universitetEllerHogskole' },
              { label: 'Annet', value: 'annet' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            ...defaultProps,
            attachmentType: 'default',
            label: 'Bekreftelse på utdanning',
            properties: { vedleggskode: 'U1', vedleggstittel: 'Bekreftelse på utdanning' },
            conditional: {
              show: true,
              when: 'hoyesteFullforteUtdanning',
              eq: 'annet',
            },
          }),
          attachment({ ...defaultProps, attachmentType: 'other' }),
        ],
      }),
    ],
  });
};

const nologinTranslations = () => {
  return getMockTranslationsFromForm(nologinForm());
};

export { nologinForm, nologinTranslations };
