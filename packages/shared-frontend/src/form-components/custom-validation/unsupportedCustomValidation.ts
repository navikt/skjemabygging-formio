import { Component, flattenComponents, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { recognizeCustomValidation } from './customValidationScripts';

/** A `validate.custom` the new renderer neither reproduces nor can prove redundant. */
interface UnsupportedCustomValidation {
  componentKey: string;
  componentType: string;
  script: string;
}

const toUnsupportedCustomValidation = (component: Component): UnsupportedCustomValidation => ({
  componentKey: component.key,
  componentType: component.type,
  script: component.validate?.custom ?? '',
});

/**
 * Every component whose `validate.custom` the new renderer would silently ignore.
 *
 * The old renderer executed these scripts, so ignoring one means a form accepts input production
 * rejects today. A form with any such script must therefore not be rendered by the new renderer,
 * even when it is on the feature allowlist - the allowlist is configuration and cannot see the form
 * definition. Recognized scripts (redundant intrinsic validation, scripts that never assigned
 * `valid`, and the expressions mapped to value rules) are not reported.
 */
const findUnsupportedCustomValidation = (form: Form): UnsupportedCustomValidation[] =>
  flattenComponents(form.components ?? [])
    .filter((component) => recognizeCustomValidation(component).kind === 'unsupported')
    .map(toUnsupportedCustomValidation);

export { findUnsupportedCustomValidation };
export type { UnsupportedCustomValidation };
