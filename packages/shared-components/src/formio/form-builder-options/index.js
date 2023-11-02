import { SANITIZE_CONFIG } from '../../util/config/sanitizeConfig';
import builderPalett from './builder-palett';
import builderEditForm from './builderEditForm';

const FormBuilderOptions = {
  builder: builderPalett,
  editForm: builderEditForm,
  language: 'nb-NO',
  sanitizeConfig: SANITIZE_CONFIG,
};

export default FormBuilderOptions;
