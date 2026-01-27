import { Tag } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';
import baseComponentUtils from '../baseComponentUtils';
import { ReactComponentType } from '../index';
import BuilderTags from './BuilderTags';

type LabelOptions = { showOptional?: boolean; showDiffTag?: boolean };

interface Props {
  component?: Component;
  parent?: ReactComponentType;
  editFields: string[];
  labelOptions?: LabelOptions;
}

/**
 * For use with Aksel component. Use <ComponentLabel> if you want a general label for your custom component with styling.
 */
const Label = ({ component, parent, editFields, labelOptions }: Props) => {
  const { translate } = useComponentUtils();

  const { getLabel, isRequired, isReadOnly } = baseComponentUtils;
  const defaultOptions = { showOptional: true, showDiffTag: true };
  const { showOptional, showDiffTag } = { ...defaultOptions, ...(labelOptions ?? {}) };
  const { builderMode } = useComponentUtils();

  return (
    <>
      {translate(getLabel(component))}
      {isRequired(component) || isReadOnly(component) ? '' : showOptional && ` (${translate('valgfritt')})`}
      {component?.prefillKey && builderMode && (
        <Tag data-color="info" variant="outline" className="mb-4" size="xsmall">
          Preutfylling
        </Tag>
      )}
      {showDiffTag && <BuilderTags component={component} parent={parent} editFields={editFields} />}
    </>
  );
};
export default Label;
