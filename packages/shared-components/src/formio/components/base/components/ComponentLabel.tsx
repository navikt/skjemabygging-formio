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
