import { Component } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * Recognition of the legacy `validate.custom` scripts published forms still carry.
 *
 * Nothing here executes a script: there is no `eval`, no `new Function`, and no Formio instance.
 * A script is matched against a small set of declarative expression forms, and only accepted when
 * the component it sits on is configured the way the expression assumes. Everything the mapper does
 * not recognize is reported as unsupported, which keeps a form the new renderer would silently
 * validate differently out of the new renderer (see `unsupportedCustomValidation`).
 *
 * This is deliberately the *only* place that knows legacy scripts exist. Generic validation
 * (`validators.ts`) sees plain value rules, and no form is recognized by its id or path.
 */

/** Collapses whitespace and drops trailing semicolons, so formatting alone never decides a match. */
const normalizeCustomScript = (script?: string): string =>
  (script ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*;+\s*$/, '')
    .trim();

/**
 * The intrinsic validation each component type already performs in the new renderer. A script that
 * only calls the matching Formio helper repeats what the component does anyway, so it is dropped.
 */
const intrinsicValidationMethods: Record<string, string[]> = {
  validateDatePicker: ['navDatepicker'],
  validateDatePickerV2: ['navDatepicker'],
  validateFnrNew: ['fnrfield'],
  validateOrganizationNumber: ['orgNr'],
  validateAccountNumber: ['bankAccount'],
  validateIban: ['iban'],
};

/**
 * The arguments those helpers were called with in published forms. Anything else means the script
 * does more than the component does, so it is not redundant.
 */
const intrinsicValidationArguments = [
  'input',
  'data',
  'row',
  'component',
  'component.beforeDateInputKey',
  'component.mayBeEqual',
  'component.earliestAllowedDate',
  'component.latestAllowedDate',
];

const submissionPathExpression = '([A-Za-z0-9_$]+(?:\\.[A-Za-z0-9_$]+)*)';
const singleQuotedString = "'((?:[^'\\\\]|\\\\.)*)'";

/** `valid = instance.<method>(<args>)` */
const intrinsicCallPattern = /^valid\s*=\s*instance\s*\.\s*([A-Za-z0-9_$]+)\s*\(([^()]*)\)$/;

/** `valid = (input !== data.<path>) ? true : '<message>'` */
const strictNotEqualPattern = new RegExp(
  `^valid\\s*=\\s*\\(\\s*input\\s*!==\\s*data\\.${submissionPathExpression}\\s*\\)\\s*\\?\\s*true\\s*:\\s*${singleQuotedString}$`,
);

/** `valid = (String(input) !== data.<path>) ? true : '<message>'` */
const stringNotEqualPattern = new RegExp(
  `^valid\\s*=\\s*\\(\\s*String\\s*\\(\\s*input\\s*\\)\\s*!==\\s*data\\.${submissionPathExpression}\\s*\\)\\s*\\?\\s*true\\s*:\\s*${singleQuotedString}$`,
);

/** `valid = instance.validateOrganizationNumber(input) && (String(input) !== data.<path>) ? true : '<message>'` */
const organizationNumberNotEqualPattern = new RegExp(
  `^valid\\s*=\\s*instance\\s*\\.\\s*validateOrganizationNumber\\s*\\(\\s*input\\s*\\)\\s*&&\\s*\\(\\s*String\\s*\\(\\s*input\\s*\\)\\s*!==\\s*data\\.${submissionPathExpression}\\s*\\)\\s*\\?\\s*true\\s*:\\s*${singleQuotedString}$`,
);

/**
 * The hand-written period check: the end date must be after the start date, and the period may not
 * be longer than a fixed number of days.
 *
 * `valid = ((endday>startday) ? true : '<after message>')` inside `if (endday<=startday)`, and
 * `valid = ((diffInDays <= N) ? true : '<max days message>')` inside `if (diffInDays > N)`.
 */
const datePeriodPattern = new RegExp(
  [
    `^var startday = new Date\\(\\s*row\\.([A-Za-z0-9_$]+)\\s*\\) ?;`,
    ` ?var endday = new Date\\(\\s*row\\.([A-Za-z0-9_$]+)\\s*\\) ?;`,
    ` ?var diffInTime = endday\\.getTime\\(\\) ?- ?startday\\.getTime\\(\\) ?;`,
    ` ?var diffInDays = diffInTime ?/ ?\\( ?1000 ?\\* ?3600 ?\\* ?24 ?\\) ?;`,
    ` ?if ?\\( ?endday ?<= ?startday ?\\) ?\\{ ?valid = \\( ?\\( ?endday ?> ?startday ?\\) ?\\? ?true ?: ?${singleQuotedString} ?\\) ?;? ?\\}`,
    ` ?else ?\\{ ?if ?\\( ?diffInDays ?> ?(\\d+) ?\\) ?\\{ ?valid = \\( ?\\( ?diffInDays ?<= ?(\\d+) ?\\) ?\\? ?true ?: ?${singleQuotedString} ?\\) ?;? ?\\} ?\\}$`,
  ].join(''),
);

/** Component types whose rendered input and headless rebuild both apply cross-field value rules. */
const notEqualComponentTypes = ['textfield', 'orgNr'];

/**
 * The value rules a recognized script is replaced by, before any referenced value is looked up.
 * Resolving the referenced values is the job of `customValidationRules`.
 */
type CustomValidationRuleSpec =
  | {
      type: 'notEqual';
      /** Submission path of the value the entered value must differ from, relative to the root. */
      referencePath: string;
      comparison: 'strict' | 'string';
      message: string;
    }
  | {
      type: 'datePeriod';
      /** Key of the sibling holding the start of the period. */
      fromKey: string;
      maxDays: number;
      afterMessage: string;
      maxDaysMessage: string;
    };

type RecognizedCustomValidation =
  /** No script, or an empty one. */
  | { kind: 'none' }
  /** Repeats the validation the component performs on its own; dropped. */
  | { kind: 'redundant'; method: string }
  /**
   * Assigns `show` and never `valid`, and repeats the component's own `customConditional`. Formio
   * reads `valid` from a custom validation script, so this never validated anything; dropped.
   */
  | { kind: 'visibility' }
  /** Replaced by declarative value rules. */
  | { kind: 'rules'; rule: CustomValidationRuleSpec }
  /** Anything else. The form must not be rendered by the new renderer. */
  | { kind: 'unsupported' };

const toRedundantMethod = (script: string, componentType: string): string | undefined => {
  const match = intrinsicCallPattern.exec(script);
  if (!match) {
    return undefined;
  }

  const [, method, argumentList] = match;
  if (!intrinsicValidationMethods[method]?.includes(componentType)) {
    return undefined;
  }

  const methodArguments = argumentList
    .split(',')
    .map((argument) => argument.trim())
    .filter((argument) => argument !== '');

  return methodArguments.every((argument) => intrinsicValidationArguments.includes(argument)) ? method : undefined;
};

const toNotEqualRule = (
  match: RegExpExecArray | null,
  comparison: 'strict' | 'string',
): CustomValidationRuleSpec | undefined => {
  if (!match) {
    return undefined;
  }
  const [, referencePath, message] = match;
  return message ? { type: 'notEqual', referencePath, comparison, message } : undefined;
};

const toDatePeriodRule = (script: string, component: Component): CustomValidationRuleSpec | undefined => {
  const match = datePeriodPattern.exec(script);
  if (!match) {
    return undefined;
  }

  const [, fromKey, toKey, afterMessage, maxDaysThreshold, maxDaysBound, maxDaysMessage] = match;

  // The script compares the component against a sibling in the same row. Only accept it when the
  // component already points at that sibling, so the period is resolved by the configuration the
  // date picker uses anyway - never by re-deriving what the script meant.
  if (toKey !== component.key || fromKey !== component.beforeDateInputKey || maxDaysThreshold !== maxDaysBound) {
    return undefined;
  }

  if (!afterMessage || !maxDaysMessage) {
    return undefined;
  }

  return { type: 'datePeriod', fromKey, maxDays: Number(maxDaysThreshold), afterMessage, maxDaysMessage };
};

/**
 * What the new renderer does with the `validate.custom` of a component. Pure: it reads the script
 * and the component's own configuration, nothing else.
 */
const recognizeCustomValidation = (component: Component): RecognizedCustomValidation => {
  const script = normalizeCustomScript(component.validate?.custom);
  if (script === '') {
    return { kind: 'none' };
  }

  const componentType = component.type;

  if (!/\bvalid\s*=[^=]/.test(script)) {
    return script === normalizeCustomScript(component.customConditional)
      ? { kind: 'visibility' }
      : { kind: 'unsupported' };
  }

  const redundantMethod = toRedundantMethod(script, componentType);
  if (redundantMethod) {
    return { kind: 'redundant', method: redundantMethod };
  }

  if (notEqualComponentTypes.includes(componentType)) {
    const rule =
      toNotEqualRule(strictNotEqualPattern.exec(script), 'strict') ??
      toNotEqualRule(stringNotEqualPattern.exec(script), 'string') ??
      (componentType === 'orgNr'
        ? toNotEqualRule(organizationNumberNotEqualPattern.exec(script), 'string')
        : undefined);
    if (rule) {
      return { kind: 'rules', rule };
    }
  }

  if (componentType === 'navDatepicker') {
    const rule = toDatePeriodRule(script, component);
    if (rule) {
      return { kind: 'rules', rule };
    }
  }

  return { kind: 'unsupported' };
};

export { normalizeCustomScript, recognizeCustomValidation };
export type { CustomValidationRuleSpec, RecognizedCustomValidation };
