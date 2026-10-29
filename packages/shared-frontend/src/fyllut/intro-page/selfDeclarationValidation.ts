import { Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { toValidationFields } from '../../components/shared/fieldValidation';
import { ValidationField } from '../../context/validation/validationTypes';

const SELF_DECLARATION_PATH = 'selfDeclaration';

/**
 * The confirmation on an enabled intro page. Pure, so the intro page and the summary page validate
 * the same rule.
 */
const toSelfDeclarationValidationFields = (form: Form, submission?: Submission): ValidationField[] =>
  form.introPage?.enabled
    ? toValidationFields(SELF_DECLARATION_PATH, submission?.selfDeclaration, {
        field: 'introPage.selfDeclaration.inputLabel',
        rules: { required: true, requiredMessage: 'introPage.selfDeclaration.validationError' },
      })
    : [];

export { SELF_DECLARATION_PATH, toSelfDeclarationValidationFields };
