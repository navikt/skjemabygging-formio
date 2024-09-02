import { Tag } from '@navikt/ds-react';
import { Component, formDiffingTool } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactComponentType } from '../index';

interface Props {
  component?: Component;
  options: ReactComponentType['options'];
  builderMode: boolean;
  editFields: string[];
}

const DiffTag = ({ component, options, builderMode, editFields }: Props) => {
  const publishedForm = options?.formConfig?.publishedForm;
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
    </>
  );
};
export default DiffTag;
