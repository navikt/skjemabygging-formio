import { Tag } from '@navikt/ds-react';
import { Component, formDiffingTool } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';

interface Props {
  component?: Component;
  editFields: string[];
}

const DiffTag = ({ component, editFields }: Props) => {
  const { formConfig, builderMode } = useComponentUtils();
  const publishedForm = formConfig?.publishedForm;

  if (!builderMode || !publishedForm) {
    return <></>;
  }

  if (!component) {
    return <></>;
  }

  const diff = formDiffingTool.generateComponentDiff(component, publishedForm, editFields);

  return (
    <>
      {diff.isNew && (
        <Tag size="xsmall" variant="warning" data-testid="diff-tag">
          Ny
        </Tag>
      )}
      {diff.changesToCurrentComponent?.length > 0 && (
        <Tag size="xsmall" variant="warning" data-testid="diff-tag">
          Endring
        </Tag>
      )}
      {diff.deletedComponents?.length > 0 && (
        <Tag size="xsmall" variant="warning" data-testid="diff-tag">
          Slettede elementer
        </Tag>
      )}
      {component.builderErrors &&
        component.builderErrors.length > 0 &&
        component.builderErrors.map((error, i) => (
          <Tag size="xsmall" variant="error" data-testid="diff-tag" key={i}>
            {error}
          </Tag>
        ))}
    </>
  );
};
export default DiffTag;
