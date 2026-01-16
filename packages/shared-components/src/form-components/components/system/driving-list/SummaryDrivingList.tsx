import { Box, FormSummary, List } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getDrivingListItems } from './drivingListUtils';

const SummaryDrivingList = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate, currentLanguage } = props;
  const { label } = component;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value?.dates || value?.dates.length === 0) {
    return null;
  }

  const drivingListDates = getDrivingListItems(value.dates, currentLanguage, translate);

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>
        {translate(TEXTS.statiske.drivingList.summaryDescription)}

        <Box marginBlock="space-16" asChild>
          <List data-aksel-migrated-v8 as="ul">
            {drivingListDates.map((drivingListDate) => (
              <List.Item key={drivingListDate}>{drivingListDate}</List.Item>
            ))}
          </List>
        </Box>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDrivingList;
