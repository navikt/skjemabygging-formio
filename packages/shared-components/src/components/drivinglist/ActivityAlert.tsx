import { Alert, BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ActivityAlertData, toLocaleDateLongMonth } from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';
import makeStyles from '../../util/styles/jss/jss';

type ActivityAlertProps = {
  vedtakData: ActivityAlertData[];
  className: string;
};

const useActivityAlertStyles = makeStyles({
  vedtakGroup: {
    marginBottom: 'var(--a-spacing-3)',
  },
});

const ActivityAlert = ({ vedtakData, className }: ActivityAlertProps) => {
  const { t, locale } = useDrivingList();
  const activityAlertStyles = useActivityAlertStyles();

  return (
    <Alert variant={'info'} className={className}>
      <Heading size="small" spacing={true}>
        {t(TEXTS.statiske.activities.yourActivities)}
      </Heading>
      <BodyShort size="medium" spacing={true}>
        {t(TEXTS.statiske.activities.registeredActivities)}
      </BodyShort>

      {vedtakData.map((vedtak) => {
        const vedtakPeriodFrom = new Date(vedtak.periode.fom);
        const vedtakPeriodTo = new Date(vedtak.periode.tom);

        const period = `${toLocaleDateLongMonth(vedtakPeriodFrom, locale)} - ${toLocaleDateLongMonth(vedtakPeriodTo, locale)}`;

        return (
          <div key={vedtak.vedtaksId} className={activityAlertStyles.vedtakGroup}>
            <Heading size="xsmall">{vedtak.aktivitetsnavn}</Heading>
            <BodyShort size="medium">{t(TEXTS.statiske.drivingList.period, { period })}</BodyShort>
            <BodyShort size="medium">{t(TEXTS.statiske.drivingList.dailyRate, { rate: vedtak.dagsats })}</BodyShort>
          </div>
        );
      })}
    </Alert>
  );
};
export default ActivityAlert;
