import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { NavFormType, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingComponent from '../components/LoadingComponent';
import LinkPanel from '../components/linkPanel/LinkPanel';
import { useAppConfig } from '../configContext';
import makeStyles from '../util/jss';

type Task = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
};
interface Props {
  form: NavFormType;
  formUrl: string;
}

const useStyles = makeStyles({
  separator: {
    border: 'solid',
  },
});
const ActiveTasks = ({ form, formUrl }: Props) => {
  const appConfig = useAppConfig();
  const { http, baseUrl } = appConfig;
  const [searchParams] = useSearchParams();
  const [activeTasks, setActiveTasks] = useState<Task[]>();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const styles = useStyles();

  console.log('formBaseUrl', formUrl);
  console.log('form', form.properties.skjemanummer);

  useEffect(() => {
    const initialize = async () => {
      const response = await http?.get<any>(
        `${baseUrl}/api/send-inn/aktive-opprettede-soknader/${form.properties.skjemanummer}`,
      );
      setActiveTasks(response.filter((task) => task.status === 'Opprettet'));
      setHasSubmitted(response.some((task) => task.status === 'Innsendt')); //TODO: sjekk om vedlegg mangler
    };
    initialize();
  }, []);

  if (!activeTasks) {
    return <LoadingComponent />;
  }

  console.log('activeTasks', activeTasks);

  return (
    <div>
      <section>
        <Heading size={'medium'}>{`Du har ${(activeTasks ?? []).length} påbegynte utkast til denne søknaden`}</Heading>
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
      </section>
      {hasSubmitted && (
        <section>
          <Heading size={'medium'}>{`Du har en eller flere innsendte søknader som mangler vedlegg`}</Heading>
          <BodyShort>Vil du ettersende vedlegg?</BodyShort>
          <LinkPanel href={`/minside`} title={'Ettersend vedlegg'} />
        </section>
      )}
      <div className={styles.separator} />
      <Button
        variant="secondary"
        onClick={() => {
          window.location.assign('www.nav.no');
        }}
      >
        Avbryt
      </Button>
    </div>
  );
};

export default ActiveTasks;
