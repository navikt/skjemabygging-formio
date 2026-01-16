import { Alert, BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { ActivityAlertData } from '../../formio/components/core/driving-list/DrivingList.utils';
import makeStyles from '../../util/styles/jss/jss';

type ActivityAlertProps = {
  vedtakData: ActivityAlertData[];
  className: string;
};

const useActivityAlertStyles = makeStyles({
  vedtakGroup: {
    marginBottom: 'var(--ax-space-12)',
  },
});

const ActivityAlert = ({ vedtakData, className }: ActivityAlertProps) => {
  const { translate, locale } = useComponentUtils();
  const activityAlertStyles = useActivityAlertStyles();

  return (
    <Alert variant={'info'} className={className}>
      <Heading size="small" spacing={true}>
        {translate(TEXTS.statiske.activities.yourActivities)}
      </Heading>
      <BodyShort size="medium" spacing={true}>
        {translate(TEXTS.statiske.activities.registeredActivities)}
      </BodyShort>

      {vedtakData.map((vedtak) => {
        const vedtakPeriodFrom = vedtak.periode.fom;
        const vedtakPeriodTo = vedtak.periode.tom;

        const period = `${dateUtils.toLocaleDateLongMonth(vedtakPeriodFrom, locale)} - ${vedtakPeriodTo ? dateUtils.toLocaleDateLongMonth(vedtakPeriodTo, locale) : ''}`;

        return (
          <div key={vedtak.vedtaksId} className={activityAlertStyles.vedtakGroup}>
            <Heading size="xsmall">{vedtak.aktivitetsnavn}</Heading>
            <BodyShort size="medium">{translate(TEXTS.statiske.drivingList.period, { period })}</BodyShort>
            <BodyShort size="medium">
              {translate(TEXTS.statiske.drivingList.dailyRate, { rate: vedtak.dagsats })}
            </BodyShort>
          </div>
        );
      })}
    </Alert>
  );
};
export default ActivityAlert;
