import { Accordion, BodyShort, Box, Button, Heading, HStack, VStack } from '@navikt/ds-react';
import { dateUtils, DrivingListSubmission, SendInnAktivitet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { fetchActivities } from '../activities/activitiesUtils';
import Alert from '../alert/Alert';
import DatePicker from '../date/DatePicker';
import RadioGroup from '../radio-group/RadioGroup';
import ReadMore, { ReadMoreProps } from '../read-more/ReadMore';
import TranslatedDescription from '../shared/TranslatedDescription';
import DrivingListPeriod from './DrivingListPeriod';
import {
  allPaperFieldsForPeriodsAreSet,
  findSelectedVedtak,
  getActivityFieldId,
  getAlreadyRefundedPeriods,
  getAvailablePeriods,
  getFuturePeriodEnd,
  mapToVedtakList,
  mapVedtakActivities,
  showAddPeriodButton,
  showRemovePeriodButton,
} from './drivingListUtils';

interface DrivingListProps {
  statePath: string;
  description?: string;
  readMore?: ReadMoreProps;
}

type DrivingListStatus = 'loading' | 'ready' | 'error';

const normalizeSubmissionDate = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (dateUtils.isValid(value, 'submission')) {
    return value;
  }

  if (dateUtils.isValid(value, 'input')) {
    return dateUtils.toSubmissionDate(value);
  }

  return undefined;
};

const DrivingList = ({ statePath, description, readMore }: DrivingListProps) => {
  const { submissionMethod, logger } = useAppConfig();
  const { translate, currentLanguage } = useLanguage();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const [status, setStatus] = useState<DrivingListStatus>('loading');
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const value = useMemo(
    () => ((stateValue as DrivingListSubmission | undefined) ?? { dates: [] }) as DrivingListSubmission,
    [stateValue],
  );
  const previousSelectedDateRef = useRef<string | undefined>(normalizeSubmissionDate(value.selectedDate));
  const vedtakOptions = useMemo(() => mapVedtakActivities(activities, currentLanguage), [activities, currentLanguage]);
  const { selectedVedtak } = findSelectedVedtak(activities, value.selectedVedtaksId);
  const availablePeriods = getAvailablePeriods(selectedVedtak);
  const alreadyRefundedPeriods = getAlreadyRefundedPeriods(selectedVedtak);
  const nextFuturePeriodEnd = getFuturePeriodEnd(selectedVedtak);

  useEffect(() => {
    if (submissionMethod !== 'digital') {
      return;
    }

    let cancelled = false;

    void fetchActivities(true)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setActivities(result);
        setStatus('ready');
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        logger?.error?.('Failed to load driving list activities', {
          statePath,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        });
        setActivities([]);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [logger, statePath, submissionMethod]);

  useEffect(() => {
    if (submissionMethod !== 'digital' || vedtakOptions.length !== 1 || value.selectedVedtaksId) {
      return;
    }

    const [singleVedtak] = vedtakOptions;
    setStateValue({
      ...value,
      selectedVedtaksId: singleVedtak.vedtaksId,
      tema: singleVedtak.tema,
    });
  }, [setStateValue, submissionMethod, value, vedtakOptions]);

  useEffect(() => {
    if (submissionMethod !== 'paper') {
      previousSelectedDateRef.current = normalizeSubmissionDate(value.selectedDate);
      return;
    }

    const selectedDate = normalizeSubmissionDate(value.selectedDate);
    const selectedDateChanged =
      !!selectedDate && !!previousSelectedDateRef.current && previousSelectedDateRef.current !== selectedDate;

    if (!selectedDate || !allPaperFieldsForPeriodsAreSet(selectedDate, value.parking)) {
      previousSelectedDateRef.current = selectedDate;
      return;
    }

    const periodCount = value.periods?.length ?? 1;
    const periods = dateUtils.generateWeeklyPeriods(selectedDate, periodCount) ?? [];

    if (selectedDateChanged) {
      setStateValue({ ...value, selectedDate, periods, dates: [] });
    } else if (!value.periods?.length) {
      setStateValue({ ...value, selectedDate, periods });
    }

    previousSelectedDateRef.current = selectedDate;
  }, [setStateValue, submissionMethod, value]);

  if (submissionMethod === 'digital' && status === 'loading') {
    return null;
  }

  const onParkingChange = (nextValue: string) => {
    setStateValue({
      ...value,
      parking: nextValue === 'true',
    });
  };

  const onActivityChange = (selectedVedtaksId: string) => {
    const selected = vedtakOptions.find((option) => option.vedtaksId === selectedVedtaksId);

    setStateValue({
      ...value,
      selectedVedtaksId,
      tema: selected?.tema,
      dates: [],
    });
  };

  const addPeriod = () => {
    const selectedDate = normalizeSubmissionDate(value.selectedDate);

    if (!selectedDate) {
      return;
    }

    setStateValue({
      ...value,
      periods: dateUtils.generateWeeklyPeriods(selectedDate, (value.periods?.length ?? 0) + 1),
    });
  };

  const removePeriod = () => {
    const selectedDate = normalizeSubmissionDate(value.selectedDate);

    if (!selectedDate || !value.periods?.length) {
      return;
    }

    const periods = dateUtils.generateWeeklyPeriods(selectedDate, value.periods.length - 1);
    const dates = value.dates?.filter((item) => {
      const date = new Date(item.date);

      return periods.some((period) => date >= new Date(period.periodFrom) && date <= new Date(period.periodTo));
    });

    setStateValue({ ...value, periods, dates });
  };

  const renderPaperDrivingList = () => (
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

  const renderDigitalDrivingList = () => {
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
                <li>
                  <BodyShort>{translate(TEXTS.statiske.drivingList.periodInfoElement1)}</BodyShort>
                </li>
                <li>
                  <BodyShort>{translate(TEXTS.statiske.drivingList.periodInfoElement2)}</BodyShort>
                </li>
                <li>
                  <BodyShort>{translate(TEXTS.statiske.drivingList.periodInfoElement3)}</BodyShort>
                </li>
                <li>
                  <BodyShort>{translate(TEXTS.statiske.drivingList.periodInfoElement4)}</BodyShort>
                </li>
              </ul>
            </Box>

            {selectedVedtak.trengerParkering && (
              <Alert variant="info">
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(translate(TEXTS.statiske.drivingList.parkingInfo)),
                  }}
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

  return (
    <>
      {description && (
        <Box marginBlock="space-0 space-16">
          <TranslatedDescription>{description}</TranslatedDescription>
        </Box>
      )}
      {submissionMethod === 'digital' ? renderDigitalDrivingList() : renderPaperDrivingList()}
      {readMore && <ReadMore {...readMore} />}
    </>
  );
};

export default DrivingList;
export type { DrivingListProps };
