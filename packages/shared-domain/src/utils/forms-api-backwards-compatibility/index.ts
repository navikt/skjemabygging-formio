import { mapFormToNavForm, mapInnsendingToSubmissionTypes, mapNavFormToForm, removeInnsendingFromForm } from './form';
import { mapPublishedGlobalTranslationsToFormioFormat } from './translations';

const formioFormsApiUtils = {
  mapFormToNavForm,
  mapNavFormToForm,
  mapPublishedGlobalTranslationsToFormioFormat,
  removeInnsendingFromForm,
  mapInnsendingToSubmissionTypes,
};

export default formioFormsApiUtils;
