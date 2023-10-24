import { BodyShort, Heading } from '@navikt/ds-react';
import { NavFormType, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import LoadingComponent from '../components/LoadingComponent';
import LinkPanel from '../components/linkPanel/LinkPanel';
import { useAppConfig } from '../configContext';

type Task = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
};
interface Props {
  form: NavFormType;
  formUrl: string;
}
const ActiveTasks = ({ form, formUrl }: Props) => {
  const appConfig = useAppConfig();
  const { http, baseUrl } = appConfig;
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [activeTasks, setActiveTasks] = useState<Task[]>();

  console.log('formBaseUrl', formUrl);
  console.log('form', form.properties.skjemanummer);

  useEffect(() => {
    const initialize = async () => {
      const response = await http?.get<any>(
        `${baseUrl}/api/send-inn/aktive-opprettede-soknader/${form.properties.skjemanummer}`,
      );
      setActiveTasks(response);
    };
    initialize();
  }, []);

  if (!activeTasks) {
    return <LoadingComponent />;
  }

  return (
    <div>
      <Heading size={'medium'}>{`Du har ${(activeTasks ?? []).length} påbegynte søknader`}</Heading>
      <BodyShort>Vil du fortsette eller starte på en ny?</BodyShort>
      {activeTasks.map((task) => (
        <LinkPanel
          key={task.innsendingsId}
          title={'Fortsett på utkast'}
          href={`${baseUrl}${formUrl}?innsendingsId=${task.innsendingsId}${
            searchParams.toString() && `&${searchParams.toString()}`
          }`}
          body={`Sist lagret ${dateUtils.toLocaleDateAndTime(task.endretDato)}`}
        />
      ))}
      <LinkPanel
        href={`${baseUrl}${formUrl}${searchParams.toString() && `?${searchParams.toString()}`}`}
        title={'Start på ny'}
      />
    </div>
  );
};

export default ActiveTasks;
