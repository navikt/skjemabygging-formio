import { Component, Submission } from '../../form';
import { Form } from '../../forms-api-form';
import FormioUtils from '../formio';
import sanitizeJavaScriptCode from '../formio/sanitize-javascript-code';
import navFormUtils from './navFormUtils';

interface EvaluateComponentProps {
  form: Form;
  submission: Submission;
  components: Component[];
  row: any;
  rowIndex?: number;
}

const evaluateComponents = (props: EvaluateComponentProps) => {
  const { form, submission, components, row = {} } = props;
  if (Array.isArray(row) && row.length > 0) {
    return row.map((rowItem) => {
      return evaluateComponents({
        ...props,
        row: rowItem,
      });
    });
  }

  return components
    .map((component) => {
      const data = Object.keys(row).length > 0 ? row : submission?.data || {};
      const visible = FormioUtils.checkCondition(
        {
          ...component,
          customConditional: sanitizeJavaScriptCode(component.customConditional),
        },
        row,
        data,
        form,
        undefined,
        submission,
      );

      if (visible) {
        if (component.components && component.components.length > 0) {
          return {
            ...component,
            components: evaluateComponents({
              ...props,
              components: component.components,
              row: navFormUtils.isSubmissionNode(component) ? data[component.key] : data,
            }),
          };
        }

        return component;
      }
    })
    .filter(Boolean);
};

const evaluateComponentsConditionals = (form: Form, submission = { data: {} }) => {
  return evaluateComponents({
    form: form,
    components: form.components,
    submission,
    row: submission.data ?? {},
  });
};

const formConditionalUtils = {
  evaluateComponentsConditionals,
};

export default formConditionalUtils;
