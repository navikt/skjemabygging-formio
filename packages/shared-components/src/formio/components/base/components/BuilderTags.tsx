import { Tag } from '@navikt/ds-react';
import { Component, formDiffingTool } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';
import baseComponentUtils from '../baseComponentUtils';
import { ReactComponentType } from '../index';

interface Props {
  component?: Component;
  parent?: ReactComponentType;
  editFields?: string[];
}

const BuilderTags = ({ component, parent, editFields }: Props) => {
  const { formConfig, builderMode } = useComponentUtils();
  const publishedForm = formConfig?.publishedForm;

  if (!builderMode) {
    return <></>;
  }

  if (!component) {
    return <></>;
  }

  const diff = formDiffingTool.generateComponentDiff(component, publishedForm, editFields);

  return (
    <>
      {publishedForm && diff.isNew && (
        <Tag data-color="warning" size="xsmall" variant="outline" data-testid="diff-tag">
          Ny
        </Tag>
      )}
      {publishedForm && diff.changesToCurrentComponent?.length > 0 && (
        <Tag data-color="warning" size="xsmall" variant="outline" data-testid="diff-tag">
          Endring
        </Tag>
      )}
      {publishedForm && diff.deletedComponents?.length > 0 && (
        <Tag data-color="warning" size="xsmall" variant="outline" data-testid="diff-tag">
          Slettede elementer
        </Tag>
      )}
      {parent &&
        baseComponentUtils.getBuilderErrors(component, parent).map((error, i) => (
          <Tag data-color="danger" size="xsmall" variant="outline" data-testid="diff-tag" key={i}>
            {error}
          </Tag>
        ))}
    </>
  );
};
export default BuilderTags;
