import { Accordion, Box, Button, Heading, HStack } from '@navikt/ds-react';
import { dateUtils, DrivingListSubmission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import DatePicker from '../date/DatePicker';
import RadioGroup from '../radio-group/RadioGroup';
import DrivingListPeriod from './DrivingListPeriod';
import { allPaperFieldsForPeriodsAreSet, showAddPeriodButton, showRemovePeriodButton } from './drivingListUtils';
import { normalizeSubmissionDate } from './useDrivingListState';

interface PaperDrivingListProps {
  addPeriod: () => void;
  onParkingChange: (nextValue: string) => void;
  removePeriod: () => void;
  statePath: string;
  value: DrivingListSubmission;
}

const PaperDrivingList = ({ addPeriod, onParkingChange, removePeriod, statePath, value }: PaperDrivingListProps) => {
  const { translate } = useLanguage();

  return (
    <>
      <DatePicker
        statePath={`${statePath}.selectedDate`}
        label={translate(TEXTS.statiske.drivingList.datePicker)}
        description={translate(TEXTS.statiske.drivingList.datePickerDescription)}
        required
        toDate={dateUtils.toSubmissionDate()}
      />
      <RadioGroup
        statePath={`${statePath}.parking`}
        legend={translate(TEXTS.statiske.drivingList.parking)}
        values={[
          { value: 'true', label: TEXTS.common.yes },
          { value: 'false', label: TEXTS.common.no },
        ]}
        value={value.parking === undefined ? '' : String(value.parking)}
        onChange={onParkingChange}
        required
      />
      {allPaperFieldsForPeriodsAreSet(normalizeSubmissionDate(value.selectedDate), value.parking) && (
        <>
          <Heading size="xsmall" level="3" spacing>
            {translate(TEXTS.statiske.drivingList.accordionHeader)}
          </Heading>
          <Accordion>
            {value.periods?.map((period) => (
              <DrivingListPeriod
                key={period.id}
                statePath={statePath}
                periodFrom={period.periodFrom}
                periodTo={period.periodTo}
                hasParking={value.parking ?? false}
              />
            ))}
          </Accordion>
          <Box marginBlock="space-16">
            <HStack gap="space-16">
              {showAddPeriodButton(value.periods) && (
                <Button type="button" size="small" variant="secondary" onClick={addPeriod}>
                  {translate(TEXTS.statiske.drivingList.addPeriod)}
                </Button>
              )}
              {showRemovePeriodButton(value.periods) && (
                <Button type="button" size="small" variant="secondary" onClick={removePeriod}>
                  {translate(TEXTS.statiske.drivingList.removePeriod)}
                </Button>
              )}
            </HStack>
          </Box>
        </>
      )}
    </>
  );
};

export default PaperDrivingList;
