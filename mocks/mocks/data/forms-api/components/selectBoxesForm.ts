import { panel, selectBoxes } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const selectBoxesForm = () => {
  const formNumber = 'selectboxes';

  return form({
    title: 'SelectBoxes component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          selectBoxes({
            label: 'Velg alternativer',
            values: [
              { label: 'Alternativ 1', value: 'alt1' },
              { label: 'Alternativ 2', value: 'alt2' },
            ],
          }),
          selectBoxes({
            label: 'Flervalg med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            values: [
              { label: 'Valg A', value: 'valgA' },
              { label: 'Valg B', value: 'valgB' },
            ],
          }),
          selectBoxes({
            label: 'Flervalg med verdi-beskrivelser',
            values: [
              { label: 'Valg med info', value: 'info', description: 'Beskrivelse for valg med info' } as any,
              { label: 'Valg uten info', value: 'noinfo' },
            ],
          }),
          selectBoxes({
            label: 'Flervalg med tilleggsbeskrivelse',
            additionalDescriptionLabel: 'Mer informasjon',
            additionalDescriptionText: '<p>Dette er tilleggsbeskrivelse</p>',
            values: [
              { label: 'Alternativ X', value: 'altX' },
              { label: 'Alternativ Y', value: 'altY' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          selectBoxes({
            label: 'Flervalg påkrevd',
            validate: { required: true },
            values: [
              { label: 'Valg 1', value: 'v1' },
              { label: 'Valg 2', value: 'v2' },
            ],
          }),
          selectBoxes({
            label: 'Flervalg ikke påkrevd',
            validate: { required: false },
            values: [
              { label: 'Valg 1', value: 'v1' },
              { label: 'Valg 2', value: 'v2' },
            ],
          }),
          {
            ...selectBoxes({
              label: 'Flervalg med standardverdi',
              values: [
                { label: 'Valg 1', value: 'v1' },
                { label: 'Valg 2', value: 'v2' },
              ],
            }),
            defaultValue: { v1: true, v2: false },
          },
        ],
      }),
    ],
  });
};

const selectBoxesTranslations = () => getMockTranslationsFromForm(selectBoxesForm());

export { selectBoxesForm, selectBoxesTranslations };
