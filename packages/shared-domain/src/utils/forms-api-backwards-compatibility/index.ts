import {
  mapEttersendingTypeToSubmissionTypes,
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
  mapEttersendingTypeToSubmissionTypes,
};

export default formioFormsApiUtils;
