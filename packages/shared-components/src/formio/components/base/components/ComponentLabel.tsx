import { Label as AkselLabel } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import Label from './Label';

type LabelOptions = { showOptional?: boolean; showDiffTag?: boolean };

interface Props {
  component?: Component;
  editFields: string[];
  labelIsHidden: boolean;
  labelOptions?: LabelOptions;
}

/**
 * Use this if you want a general label for your custom component. Use <Label> if you are using this in Aksel component.
 */
const ComponentLabel = ({ component, editFields, labelIsHidden, labelOptions }: Props) => {
  return (
    <>
      {!labelIsHidden && (
        <AkselLabel>
          <Label component={component} editFields={editFields} labelOptions={labelOptions} />
        </AkselLabel>
      )}
    </>
  );
};
export default ComponentLabel;
