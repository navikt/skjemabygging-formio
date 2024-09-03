import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { getLabel, getLegend, isRequired } from '../baseComponentUtils';
import { ReactComponentType } from '../index';
import DiffTag from './DiffTag';

type LabelOptions = { showOptional?: boolean; showDiffTag?: boolean; useLegend?: boolean };

interface Props {
  component?: Component;
  translate: any;
  options: ReactComponentType['options'];
  builderMode: boolean;
  editFields: string[];
  labelOptions?: LabelOptions;
}

const Label = ({ component, translate, options, builderMode, editFields, labelOptions }: Props) => {
  const defaultOptions = { showOptional: true, showDiffTag: true, useLegend: false };
  const { showOptional, showDiffTag, useLegend } = { ...defaultOptions, ...(labelOptions ?? {}) };

  return (
    <>
      {translate(useLegend ? getLegend(component) : getLabel(component))}
      {isRequired(component) || !!component?.readOnly ? '' : showOptional && ` (${translate('valgfritt')})`}
      {showDiffTag && (
        <DiffTag component={component} options={options} builderMode={builderMode} editFields={editFields} />
      )}
    </>
  );
};
export default Label;
