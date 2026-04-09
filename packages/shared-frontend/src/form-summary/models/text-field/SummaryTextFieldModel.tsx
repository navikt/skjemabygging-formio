import { FormSummary } from '@navikt/ds-react';
import { ResolvedTextFieldModel } from '@navikt/skjemadigitalisering-shared-form';

interface Props {
  componentModel: ResolvedTextFieldModel;
}

const SummaryTextFieldModel = ({ componentModel }: Props) => {
  const { hideLabel, translatedLabel, value } = componentModel;

  return (
    <FormSummary.Answer>
      {!hideLabel && translatedLabel && <FormSummary.Label>{translatedLabel}</FormSummary.Label>}
      <FormSummary.Value>{value}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryTextFieldModel;
