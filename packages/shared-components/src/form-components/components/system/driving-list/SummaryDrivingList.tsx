import { FormSummary, List } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryDrivingList = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const { translate, currentLanguage } = useLanguages();

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value?.dates || value?.dates.length === 0) {
    return null;
  }

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
          {value?.dates
            ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((date) => {
              const formattedDate = dateUtils.toWeekdayAndDate(date.date, currentLanguage);
              return (
                <List.Item key={date.date}>
                  {date.parking
                    ? translate(TEXTS.statiske.drivingList.summaryTextParking, {
                        date: formattedDate,
                        parking: date.parking,
                      })
                    : formattedDate}
                </List.Item>
              );
            })}
        </List>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDrivingList;
