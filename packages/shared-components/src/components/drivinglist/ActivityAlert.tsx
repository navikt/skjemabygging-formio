import { Alert, BodyShort, Heading } from '@navikt/ds-react';
import { AktivitetVedtaksinformasjon, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { toLocaleDate } from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';

type ActivityAlertProps = {
  activityName: string;
  vedtak: AktivitetVedtaksinformasjon;
  className?: string;
};

const ActivityAlert = ({ activityName, vedtak, className }: ActivityAlertProps) => {
  const { t } = useDrivingList();

  const vedtakPeriodFrom = new Date(vedtak.periode.fom);
  const vedtakPeriodTo = new Date(vedtak.periode.tom);

  const period = `${toLocaleDate(vedtakPeriodFrom)} - ${toLocaleDate(vedtakPeriodTo)}`;

  return (
    <Alert variant={'info'} className={className}>
      <Heading size="xsmall">{t(TEXTS.statiske.drivingList.activity)}</Heading>
      <BodyShort size="medium" spacing={true}>
        {activityName}
      </BodyShort>

      <Heading size="xsmall">{t(TEXTS.statiske.drivingList.period)}</Heading>
      <BodyShort size="medium" spacing={true}>
        {period}
      </BodyShort>

      <Heading size="xsmall">{t(TEXTS.statiske.drivingList.dailyRate)}</Heading>
      <BodyShort size="medium" spacing={true}>
        {`${vedtak.dagsats}kr`}
      </BodyShort>
    </Alert>
  );
};
export default ActivityAlert;
