import { organizationNumber, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const organizationNumberCoverPageForm = () => {
  const formNumber = 'coverpageorganizationnumber';

  return form({
    title: 'Cover page organization number test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          organizationNumber({
            label: 'Organisasjonsnummer',
            coverPageBruker: true,
          }),
          organizationNumber({
            label: 'Organisasjonsnummer med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          organizationNumber({
            label: 'Organisasjonsnummer påkrevd',
            validate: { required: true, custom: 'valid = instance.validateOrganizationNumber(input)' },
          }),
          organizationNumber({
            label: 'Organisasjonsnummer ikke påkrevd',
            validate: { required: false },
          }),
          organizationNumber({
            label: 'Organisasjonsnummer ugyldig format',
            validate: { required: false, custom: 'valid = instance.validateOrganizationNumber(input)' },
          }),
          organizationNumber({
            label: 'Organisasjonsnummer egendefinert',
            validate: { required: false, custom: 'valid = input === "889640782" ? true : "Kun 889640782 er tillatt"' },
          }),
        ],
      }),
    ],
  });
};

const organizationNumberCoverPageTranslations = () => getMockTranslationsFromForm(organizationNumberCoverPageForm());

export { organizationNumberCoverPageForm, organizationNumberCoverPageTranslations };
