import { FormSummary } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../../context/languages';

interface Props {
  component: Component;
}

const DefaultLabel = ({ component }: Props) => {
  const { hideLabel, label } = component;
  const { translate } = useLanguages();

  if (!label || hideLabel) {
    return null;
  }

  return <FormSummary.Label>{translate(label)}</FormSummary.Label>;
};

export default DefaultLabel;
