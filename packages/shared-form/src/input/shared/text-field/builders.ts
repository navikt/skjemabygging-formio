import type { Component, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import formComponentUtils from '../../../pdf/utils/formComponent';
import type { SharedFormInputValidators, SharedFormTextFieldInputNode } from '../../types';

interface TextFieldInputBuilderProps {
  component: Component;
  submissionPath: string;
  submission?: Submission;
  translate: TranslateFunction;
  validators?: Pick<
    SharedFormInputValidators,
    'required' | 'minLength' | 'maxLength' | 'nationalIdentityNumber' | 'coverPage'
  >;
  autoComplete?: string;
  readOnly?: boolean;
}

const buildTextFieldInputNode = ({
  component,
  submissionPath,
  submission,
  translate,
  validators,
  autoComplete,
  readOnly,
}: TextFieldInputBuilderProps): SharedFormTextFieldInputNode => ({
  type: 'text-field',
  key: component.key,
  component,
  submissionPath,
  label: component.label ? translate(component.label) : undefined,
  description: component.description ? translate(component.description) : undefined,
  value: formComponentUtils.getSubmissionValue(submissionPath, submission),
  validators,
  autoComplete,
  readOnly,
});

export { buildTextFieldInputNode };
export type { TextFieldInputBuilderProps };
