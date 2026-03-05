import { address, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const adresseTestForm = () => {
  const formNumber = 'adresse';

  return form({
    title: 'Address component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Norsk adresse',
        components: [address({ addressType: 'NORWEGIAN_ADDRESS', key: 'norsk' })],
      }),
      panel({
        title: 'Postboksadresse',
        components: [address({ addressType: 'POST_OFFICE_BOX', key: 'postboks' })],
      }),
      panel({
        title: 'Utenlandsk adresse',
        components: [address({ addressType: 'FOREIGN_ADDRESS', key: 'utland' })],
      }),
      panel({
        title: 'Adressevalg',
        components: [
          {
            ...address({ key: 'adressevalg' }),
            // addressType is omitted so the address type choice is shown (borDuINorge radio)
            addressType: undefined,
            prefillKey: 'sokerAdresser',
            customLabels: { livesInNorway: 'Bor du i Norge?' },
          },
        ],
      }),
    ],
  });
};

const adresseTranslations = () => getMockTranslationsFromForm(adresseTestForm());

export { adresseTestForm, adresseTranslations };
