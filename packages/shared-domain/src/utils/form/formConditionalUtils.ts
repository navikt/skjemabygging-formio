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
  parentKey?: string;
}

const evaluateComponents = (props: EvaluateComponentProps) => {
  const { form, submission, components, row = {}, parentKey } = props;

  if (Array.isArray(row) && row.length > 0) {
    return row.flatMap((rowItem) => {
      return evaluateComponents({
        ...props,
        row: rowItem,
      });
    });
  }

  return components
    .map((component) => {
      const data = submission?.data || {};
      const conditionalRow = component.conditional?.when && parentKey ? { [parentKey]: row } : row;
      const visible = FormioUtils.checkCondition(
        {
          ...component,
          customConditional: sanitizeJavaScriptCode(component.customConditional),
        },
        conditionalRow,
        data,
        form,
        undefined,
        submission,
      );

      const rowData = row && Object.keys(row).length > 0 ? row : data;

      if (visible) {
        if (component.components && component.components.length > 0) {
          return {
            ...component,
            components: evaluateComponents({
              ...props,
              components: component.components,
              row: navFormUtils.isSubmissionNode(component) ? rowData[component.key] : rowData,
              parentKey: component.key,
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
