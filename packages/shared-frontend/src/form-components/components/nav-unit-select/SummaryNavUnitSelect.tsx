import { FormSummary } from '@navikt/ds-react';
import { TEXTS, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useNavUnits } from '../../../components/nav-unit-select/useNavUnits';
import { NavUnitSelectDefinition } from '../../component-types';
import { DefaultLabel } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryNavUnitSelect = (props: FormComponentProps<NavUnitSelectDefinition>) => {
  const { availableUnits, loading } = useNavUnits({ unitTypes: props.component.unitTypes });
  const value = submissionUtils.getSubmissionValue(props.submissionPath, props.submission);
  if (!value) return null;
  const selectedUnit = availableUnits?.find((unit) => unit.enhetNr === value);

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>
        {loading ? props.translate(TEXTS.statiske.loading) : (selectedUnit?.navn ?? value)}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNavUnitSelect;
