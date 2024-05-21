import { BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

const PeriodInfo = () => {
  const { translate } = useComponentUtils();

  return (
    <div className="mb">
      <Heading size="small" spacing={true}>
        {translate(TEXTS.statiske.drivingList.periodInfoHeader)}
      </Heading>
      <BodyShort size="medium" spacing={true}>
        {translate(TEXTS.statiske.drivingList.periodInfoSubheader)}
      </BodyShort>
      <BodyShort size="medium" spacing={true}>
        {translate(TEXTS.statiske.drivingList.periodInfoYouCan)}
      </BodyShort>
      <ul>
        <li>
          <BodyShort size="medium" spacing={true}>
            {translate(TEXTS.statiske.drivingList.periodInfoElement1)}
          </BodyShort>
        </li>
        <li>
          <BodyShort size="medium" spacing={true}>
            {translate(TEXTS.statiske.drivingList.periodInfoElement2)}
          </BodyShort>
        </li>
        <li>
          <BodyShort size="medium" spacing={true}>
            {translate(TEXTS.statiske.drivingList.periodInfoElement3)}
          </BodyShort>
        </li>
        <li>
          <BodyShort size="medium" spacing={true}>
            {translate(TEXTS.statiske.drivingList.periodInfoElement4)}
          </BodyShort>
        </li>
      </ul>
    </div>
  );
};

export default PeriodInfo;
