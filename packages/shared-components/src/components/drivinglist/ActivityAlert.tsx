import { Alert, BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { AktivitetVedtaksinformasjon } from '../../../../shared-domain/src/sendinn/activity';
import { toLocaleDate } from '../../formio/components/core/driving-list/DrivingList.utils';

type ActivityAlertProps = {
  activityName: string;
  vedtak: AktivitetVedtaksinformasjon;
  t: any;
};

const ActivityAlert = ({ activityName, vedtak, t }: ActivityAlertProps) => {
  const vedtakPeriodFrom = new Date(vedtak.periode.fom);
  const vedtakPeriodTo = new Date(vedtak.periode.tom);

  return (
    <Alert variant={'info'}>
      {
        <>
          <Heading size="xsmall">{t(TEXTS.statiske.drivingList.activity)}</Heading>
          <BodyShort size="medium" spacing={true}>
            {activityName}
          </BodyShort>

          <Heading size="xsmall">{t(TEXTS.statiske.drivingList.period)}</Heading>
          <BodyShort size="medium" spacing={true}>{`${toLocaleDate(vedtakPeriodFrom)} - ${toLocaleDate(
            vedtakPeriodTo,
          )}`}</BodyShort>

          <Heading size="xsmall">{t(TEXTS.statiske.drivingList.dailyRate)}</Heading>
          <BodyShort size="medium" spacing={true}>
            {vedtak.dagsats}
          </BodyShort>
        </>
      }
    </Alert>
  );
};
export default ActivityAlert;
