import { Accordion, BodyShort, Box, Heading, VStack } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import Alert from '../alert/Alert';
import RadioGroup from '../radio-group/RadioGroup';
import DrivingListPeriod from './DrivingListPeriod';
import { getActivityFieldId, mapToVedtakList } from './drivingListUtils';
import { DrivingListState } from './useDrivingListState';

type DigitalDrivingListProps = Pick<
  DrivingListState,
  | 'activities'
  | 'alreadyRefundedPeriods'
  | 'availablePeriods'
  | 'nextFuturePeriodEnd'
  | 'onActivityChange'
  | 'selectedVedtak'
  | 'status'
  | 'value'
  | 'vedtakOptions'
> & { statePath: string };

const DigitalDrivingList = ({
  activities,
  alreadyRefundedPeriods,
  availablePeriods,
  nextFuturePeriodEnd,
  onActivityChange,
  selectedVedtak,
  statePath,
  status,
  value,
  vedtakOptions,
}: DigitalDrivingListProps) => {
  const { currentLanguage, translate } = useLanguage();

  if (status === 'error') {
    return (
      <div id={getActivityFieldId(statePath)} tabIndex={-1}>
        <Alert variant="error">{translate(TEXTS.statiske.activities.error)}</Alert>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div id={getActivityFieldId(statePath)} tabIndex={-1}>
        <Alert variant="info">
          <Heading size="small" spacing>
            {translate(TEXTS.statiske.drivingList.noVedtakHeading)}
          </Heading>
          <BodyShort>{translate(TEXTS.statiske.drivingList.noVedtak)}</BodyShort>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Alert variant="info">
        <Heading size="small" spacing>
          {translate(TEXTS.statiske.activities.yourActivities)}
        </Heading>
        <BodyShort spacing>{translate(TEXTS.statiske.activities.registeredActivities)}</BodyShort>
        <VStack gap="space-12">
          {mapToVedtakList(activities).map((vedtak) => {
            const period = `${dateUtils.toLocaleDateLongMonth(vedtak.periode.fom, currentLanguage)} - ${
              vedtak.periode.tom ? dateUtils.toLocaleDateLongMonth(vedtak.periode.tom, currentLanguage) : ''
            }`;
            return (
              <Box key={vedtak.vedtaksId}>
                <Heading size="xsmall" level="3">
                  {vedtak.aktivitetsnavn}
                </Heading>
                <BodyShort>{translate(TEXTS.statiske.drivingList.period, { period })}</BodyShort>
                <BodyShort>{translate(TEXTS.statiske.drivingList.dailyRate, { rate: vedtak.dagsats })}</BodyShort>
              </Box>
            );
          })}
        </VStack>
      </Alert>
      {vedtakOptions.length > 1 && (
        <RadioGroup
          statePath={`${statePath}.selectedVedtaksId`}
          legend={translate(TEXTS.statiske.activities.label)}
          values={vedtakOptions.map((option) => ({
            value: option.vedtaksId ?? option.aktivitetId,
            label: option.text,
          }))}
          value={value.selectedVedtaksId ?? ''}
          onChange={onActivityChange}
          required
        />
      )}
      {selectedVedtak && (
        <>
          <Box marginBlock="space-0 space-16">
            <Heading size="small" level="3" spacing>
              {translate(TEXTS.statiske.drivingList.periodInfoHeader)}
            </Heading>
            <BodyShort spacing>{translate(TEXTS.statiske.drivingList.periodInfoSubheader)}</BodyShort>
            <BodyShort spacing>{translate(TEXTS.statiske.drivingList.periodInfoYouCan)}</BodyShort>
            <ul>
              {[1, 2, 3, 4].map((item) => (
                <li key={item}>
                  <BodyShort>{translate(TEXTS.statiske.drivingList[`periodInfoElement${item}`])}</BodyShort>
                </li>
              ))}
            </ul>
          </Box>
          {selectedVedtak.trengerParkering && (
            <Alert variant="info">
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(TEXTS.statiske.drivingList.parkingInfo)) }}
              />
            </Alert>
          )}
          <Heading size="xsmall" level="3" spacing>
            {translate(TEXTS.statiske.drivingList.accordionHeader)}
          </Heading>
          {availablePeriods.length === 0 && nextFuturePeriodEnd && (
            <Alert variant="info">
              {translate(TEXTS.statiske.drivingList.noPeriods, {
                date: dateUtils.toLocaleDateLongMonth(nextFuturePeriodEnd, currentLanguage),
              })}
            </Alert>
          )}
          {availablePeriods.length > 0 && (
            <Accordion>
              {availablePeriods.map((period) => (
                <DrivingListPeriod
                  key={period.betalingsplanId}
                  statePath={statePath}
                  periodFrom={period.utgiftsperiode.fom}
                  periodTo={period.utgiftsperiode.tom}
                  hasParking={selectedVedtak.trengerParkering}
                  dailyRate={selectedVedtak.dagsats}
                  betalingsplan={period}
                />
              ))}
            </Accordion>
          )}
          {alreadyRefundedPeriods.length > 0 && (
            <Box marginBlock="space-16">
              <Heading size="small" level="3" spacing>
                {translate(TEXTS.statiske.drivingList.previousDrivingList)}
              </Heading>
              <ul>
                {alreadyRefundedPeriods.map((period) => (
                  <li key={period.betalingsplanId}>
                    <BodyShort>
                      {`${dateUtils.toLocaleDateLongMonth(period.utgiftsperiode.fom, currentLanguage)} - ${
                        period.utgiftsperiode.tom
                          ? dateUtils.toLocaleDateLongMonth(period.utgiftsperiode.tom, currentLanguage)
                          : ''
                      }`}
                    </BodyShort>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default DigitalDrivingList;
