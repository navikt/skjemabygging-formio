import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';
import baseComponentUtils from '../baseComponentUtils';
import DiffTag from './DiffTag';

type LabelOptions = { showOptional?: boolean; showDiffTag?: boolean };

interface Props {
  component?: Component;
  editFields: string[];
  labelOptions?: LabelOptions;
}

const Label = ({ component, editFields, labelOptions }: Props) => {
  const { translate } = useComponentUtils();

  const { getLabel, isRequired, isReadOnly } = baseComponentUtils;
  const defaultOptions = { showOptional: true, showDiffTag: true };
  const { showOptional, showDiffTag } = { ...defaultOptions, ...(labelOptions ?? {}) };

  return (
    <>
      {translate(getLabel(component))}
      {isRequired(component) || isReadOnly(component) ? '' : showOptional && ` (${translate('valgfritt')})`}
      {showDiffTag && <DiffTag component={component} editFields={editFields} />}
    </>
  );
};
export default Label;
