import { checkbox, maalgruppe, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

// Maalgruppe is a hidden data-only component.
// It renders nothing in the UI (renderReact returns empty fragment).
// The keys below (ensligArbSoker, dagpenger) map to maalgruppe types in Maalgruppe.utils.ts.

const maalgruppeForm = () => {
  const formNumber = 'maalgruppe';

  return form({
    title: 'Maalgruppe component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Beregning',
        components: [
          checkbox({
            label: 'Enslig forsørger arbeidssøker',
            key: 'ensligArbSoker',
          }),
          checkbox({
            label: 'Dagpenger',
            key: 'dagpenger',
          }),
          maalgruppe(),
        ],
      }),
    ],
  });
};

const maalgruppeTranslations = () => getMockTranslationsFromForm(maalgruppeForm());

export { maalgruppeForm, maalgruppeTranslations };
