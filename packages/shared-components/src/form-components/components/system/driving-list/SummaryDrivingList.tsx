import { FormSummary, List } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import { getDrivingListItems } from './drivingListUtils';

const SummaryDrivingList = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const languagesContextValue = useLanguages();
  const { translate } = languagesContextValue;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value?.dates || value?.dates.length === 0) {
    return null;
  }

  const drivingListDates = getDrivingListItems(value.dates, languagesContextValue);

  return (
    <FormSummary.Answer>
      <DefaultLabel
        component={{
          ...component,
          hideLabel: false,
        }}
      />
      <FormSummary.Value>
        {translate(TEXTS.statiske.drivingList.summaryDescription)}

        <List as="ul">
          {drivingListDates.map((drivingListDate) => (
            <List.Item key={drivingListDate}>{drivingListDate}</List.Item>
          ))}
        </List>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDrivingList;
