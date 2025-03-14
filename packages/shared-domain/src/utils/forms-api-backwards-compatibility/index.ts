import {
  mapFormToNavForm,
  mapInnsendingTypeToSubmissionTypes,
  mapNavFormToForm,
  removeInnsendingFromForm,
} from './form';
import { mapPublishedGlobalTranslationsToFormioFormat } from './translations';

const formioFormsApiUtils = {
  mapFormToNavForm,
  mapNavFormToForm,
  mapPublishedGlobalTranslationsToFormioFormat,
  removeInnsendingFromForm,
  mapInnsendingTypeToSubmissionTypes,
};

export default formioFormsApiUtils;
