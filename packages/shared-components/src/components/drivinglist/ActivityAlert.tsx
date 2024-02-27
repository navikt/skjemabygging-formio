import { Alert, BodyShort, Heading } from '@navikt/ds-react';
import { AktivitetVedtaksinformasjon, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { toLocaleDate } from '../../formio/components/core/driving-list/DrivingList.utils';

type ActivityAlertProps = {
  activityName: string;
  vedtak: AktivitetVedtaksinformasjon;
  t: TFunction;
  className?: string;
};

const ActivityAlert = ({ activityName, vedtak, t, className }: ActivityAlertProps) => {
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
        {vedtak.dagsats}
      </BodyShort>
    </Alert>
  );
};
export default ActivityAlert;
