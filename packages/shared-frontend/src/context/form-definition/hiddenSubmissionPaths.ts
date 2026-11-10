import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from '../../form-components/component-types';
import { collectDataGridRowScopes, collectInputSubmissionPathsInCurrentScope } from './dataGridRows';
import { getResolvedSubmissionPath, toComponentDefinitions } from './formDefinitionUtils';

interface HiddenSubmissionPathArgs {
  form: Form;
  activeComponents: ComponentDefinition[];
  submission?: Submission;
  submissionMethod?: SubmissionMethod;
}

/**
 * Submission paths that must be cleared because their component is hidden.
 *
 * Data grid children are handled per row: their conditionals are evaluated against the row, and the
 * cleared path is the indexed row path (`key[index].child`), so hiding a field in one row never
 * touches the same field in another row.
 */
const collectHiddenSubmissionPaths = ({
  form,
  activeComponents,
  submission,
  submissionMethod,
}: HiddenSubmissionPathArgs): string[] => {
  const visiblePaths = new Set(
    collectInputSubmissionPathsInCurrentScope(activeComponents).map(({ submissionPath }) => submissionPath),
  );

  const hiddenPaths = collectInputSubmissionPathsInCurrentScope(toComponentDefinitions(form.components))
    .filter(({ submissionPath }) => !visiblePaths.has(submissionPath))
    .map(({ submissionPath }) => submissionPath);

  const activeRowScopes = collectDataGridRowScopes({
    components: activeComponents,
    submission,
    form,
    submissionMethod,
  });
  const visiblePathsByRowScope = activeRowScopes.reduce((pathsByRowScope, scope) => {
    const rowScope = `${getResolvedSubmissionPath(scope.dataGridComponent)}[${scope.index}]`;
    const visiblePaths = pathsByRowScope.get(rowScope) ?? new Set<string>();
    collectInputSubmissionPathsInCurrentScope(scope.activeComponents).forEach(({ submissionPath }) => {
      visiblePaths.add(submissionPath);
    });
    pathsByRowScope.set(rowScope, visiblePaths);
    return pathsByRowScope;
  }, new Map<string, Set<string>>());

  const hiddenRowPaths = collectDataGridRowScopes({
    components: toComponentDefinitions(form.components),
    submission,
    form,
    submissionMethod,
  }).flatMap((scope) => {
    const rowScope = `${getResolvedSubmissionPath(scope.dataGridComponent)}[${scope.index}]`;
    const visibleRowPaths = visiblePathsByRowScope.get(rowScope) ?? new Set<string>();

    return collectInputSubmissionPathsInCurrentScope(scope.components)
      .filter(({ submissionPath }) => !visibleRowPaths.has(submissionPath))
      .map(({ submissionPath }) => submissionPath);
  });

  return [...new Set([...hiddenPaths, ...hiddenRowPaths])];
};

export { collectHiddenSubmissionPaths };
