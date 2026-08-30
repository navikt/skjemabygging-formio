import { Component, Form, Panel, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import {
  collectDataGridRowScopes,
  collectInputSubmissionPaths,
} from '../../form-components/components/data-grid/dataGridRows';

interface HiddenSubmissionPathArgs {
  form: Form;
  activeComponents: Component[];
  panels: Panel[];
  submission?: Submission;
  submissionMethod?: SubmissionMethod;
}

/**
 * Submission paths that must be cleared because their component is hidden and does not opt out with
 * `clearOnHide: false`.
 *
 * Data grid children are handled per row: their conditionals are evaluated against the row, and the
 * cleared path is the indexed row path (`key[index].child`), so hiding a field in one row never
 * touches the same field in another row.
 */
const collectHiddenSubmissionPaths = ({
  form,
  activeComponents,
  panels,
  submission,
  submissionMethod,
}: HiddenSubmissionPathArgs): string[] => {
  const visibleComponents = [...activeComponents, ...panels];
  const visiblePaths = new Set(
    collectInputSubmissionPaths(visibleComponents).map(({ submissionPath }) => submissionPath),
  );

  const hiddenPaths = collectInputSubmissionPaths(form.components)
    .filter(({ component, submissionPath }) => component.clearOnHide !== false && !visiblePaths.has(submissionPath))
    .map(({ submissionPath }) => submissionPath);

  const hiddenRowPaths = collectDataGridRowScopes({
    components: visibleComponents,
    submission,
    form,
    submissionMethod,
  }).flatMap((scope) => {
    const visibleRowPaths = new Set(
      collectInputSubmissionPaths(scope.activeComponents).map(({ submissionPath }) => submissionPath),
    );

    return collectInputSubmissionPaths(scope.components)
      .filter(
        ({ component, submissionPath }) => component.clearOnHide !== false && !visibleRowPaths.has(submissionPath),
      )
      .map(({ submissionPath }) => submissionPath);
  });

  return [...new Set([...hiddenPaths, ...hiddenRowPaths])];
};

export { collectHiddenSubmissionPaths };
