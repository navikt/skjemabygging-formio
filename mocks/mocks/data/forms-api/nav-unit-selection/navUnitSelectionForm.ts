import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';
import { createSubmissionTypeForm } from '../shared/createSubmissionTypeForm';

const navUnitSelectionForm = () => {
  const form = createSubmissionTypeForm({
    title: 'NAV unit selection form',
    formNumber: 'NAV-UNIT-SELECTION',
    path: 'navunitselection',
    submissionTypes: ['PAPER'],
    includeAttachmentPanel: false,
    includeSelfDeclaration: false,
  });

  return {
    ...form,
    properties: {
      ...form.properties,
      enhetMaVelgesVedPapirInnsending: true,
      enhetstyper: ['ALS'],
      navUnitDescription: 'Velg riktig NAV-enhet',
    },
  };
};

const navUnitSelectionTranslations = () => getMockTranslationsFromForm(navUnitSelectionForm());

export { navUnitSelectionForm, navUnitSelectionTranslations };
