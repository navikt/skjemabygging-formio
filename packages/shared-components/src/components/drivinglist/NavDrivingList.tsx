import { Alert, BodyShort, Heading, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import DrivingListFromActivities from './DrivingListFromActivities';
import DrivingListFromDates from './DrivingListFromDates';

const NavDrivingList = () => {
  const { translate, appConfig } = useComponentUtils();
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);

  const submissionMethod = appConfig?.submissionMethod;
  const isLoggedIn = appConfig?.config?.isLoggedIn;
  const app = appConfig?.app;

  useEffect(() => {
    const fetchData = async () => {
      if (app === 'fyllut' && isLoggedIn && submissionMethod === 'digital') {
        try {
          setLoading(true);
          const result = await getActivities(appConfig, true);

          if (result) {
            setActivities(result);
          }
          setLoading(false);
        } catch (_ex) {
          setLoading(false);
          setShowError(true);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderNoActivitiesAlert = () => {
    return (
      <Alert variant="info">
        <Heading size="small" spacing={true}>
          {translate(TEXTS.statiske.drivingList.noVedtakHeading)}
        </Heading>
        <BodyShort size="medium" spacing={true}>
          {translate(TEXTS.statiske.drivingList.noVedtak)}
        </BodyShort>
      </Alert>
    );
  };

  const renderDrivingList = () => {
    if (loading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    }

    if (showError) {
      return <Alert variant="error">{translate(TEXTS.statiske.activities.error)}</Alert>;
    }

    if (submissionMethod === 'digital' && activities.length === 0) {
      return renderNoActivitiesAlert();
    }

    if (submissionMethod === 'paper') {
      return <DrivingListFromDates />;
    }

    if (submissionMethod === 'digital') {
      return <DrivingListFromActivities activities={activities} />;
    }

    return <DrivingListFromDates />;
  };

  return renderDrivingList();
};

export default NavDrivingList;
