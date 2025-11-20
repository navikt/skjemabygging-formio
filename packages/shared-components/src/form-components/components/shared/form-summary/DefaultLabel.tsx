import { FormSummary } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';

const DefaultLabel = (props: FormComponentProps) => {
  const { component, translate } = props;
  const { hideLabel, label } = component;

  if (!label || hideLabel) {
    return null;
  }

  return <FormSummary.Label>{translate(label)}</FormSummary.Label>;
};

export default DefaultLabel;
