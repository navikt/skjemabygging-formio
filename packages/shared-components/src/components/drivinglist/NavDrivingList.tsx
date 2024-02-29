import { Alert, Skeleton } from '@navikt/ds-react';
import {
  DrivingListSubmission,
  DrivingListValues,
  SendInnAktivitet,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { AppConfigContextType } from '../../context/config/configContext';
import DrivingListFromActivities from './DrivingListFromActivities';
import DrivingListFromDates from './DrivingListFromDates';

interface NavDrivingListProps {
  onValueChange: (value: object) => void;
  appConfig: AppConfigContextType;
  values: DrivingListSubmission;
  t: TFunction;
  locale: string;
}

const NavDrivingList = ({ appConfig, onValueChange, values, t, locale }: NavDrivingListProps) => {
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
          const result = await getActivities(appConfig);

          if (result) {
            setActivities(result);
          }
          setLoading(false);
        } catch (ex) {
          setLoading(false);
          setShowError(true);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateValues = (multipleValues: DrivingListValues) => {
    onValueChange({ ...values, ...multipleValues });
  };

  const renderDrivingListFromActivities = () => {
    return (
      <DrivingListFromActivities
        values={values}
        t={t}
        activities={activities}
        updateValues={updateValues}
        appConfig={appConfig}
      />
    );
  };

  const renderDrivingListFromDates = () => {
    return (
      <DrivingListFromDates values={values} t={t} locale={locale} updateValues={updateValues}></DrivingListFromDates>
    );
  };

  const renderNoActivitiesAlert = () => {
    return <Alert variant="info">{t(TEXTS.statiske.drivingList.noVedtak)}</Alert>;
  };

  const renderDrivingList = () => {
    if (loading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    }

    if (showError) {
      return <Alert variant="error">{t(TEXTS.statiske.activities.error)}</Alert>;
    }

    if (submissionMethod === 'digital' && activities.length === 0) {
      return renderNoActivitiesAlert();
    }

    if (submissionMethod === 'paper') {
      return renderDrivingListFromDates();
    }

    if (submissionMethod === 'digital') {
      return renderDrivingListFromActivities();
    }

    return renderDrivingListFromDates();
  };

  return renderDrivingList();
};

export default NavDrivingList;
