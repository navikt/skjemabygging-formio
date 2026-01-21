import { Label as AkselLabel } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactComponentType } from '../index';
import Label from './Label';

type LabelOptions = { showOptional?: boolean; showDiffTag?: boolean };

interface Props {
  component?: Component;
  parent?: ReactComponentType;
  editFields: string[];
  labelIsHidden: boolean;
  labelOptions?: LabelOptions;
  labelId?: string;
  htmlFor?: string;
}

/**
 * Use this if you want a general label for your custom component. Use <Label> if you are using this in Aksel component.
 */
const ComponentLabel = ({ component, parent, editFields, labelIsHidden, labelOptions, labelId, htmlFor }: Props) => {
  return (
    <>
      {!labelIsHidden && (
        <AkselLabel id={labelId} htmlFor={htmlFor}>
          <Label component={component} parent={parent} editFields={editFields} labelOptions={labelOptions} />
        </AkselLabel>
      )}
    </>
  );
};
export default ComponentLabel;
