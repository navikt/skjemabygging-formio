import { DocPencilIcon, FileExportIcon, PencilIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { NavFormType, TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingComponent from '../components/LoadingComponent';
import LinkPanel from '../components/linkPanel/LinkPanel';
import { useAppConfig } from '../configContext';
import { useLanguages } from '../context/languages';
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
  section: {
    maxWidth: '38rem',
    marginBottom: '3.75rem',
  },
  sectionHeading: {
    marginBottom: '0.5rem',
  },
  sectionBody: {
    marginBottom: '1.25rem',
  },
  linkPanel: {
    marginBottom: '0.75rem',
  },
  separator: {
    border: `1px solid var(--a-grayalpha-300)`,
    marginBottom: `1.75rem`,
  },
  icon: {
    color: 'var(--a-deepblue-500)',
  },
});

const ActiveTasks = ({ form, formUrl }: Props) => {
  const appConfig = useAppConfig();
  const { http, baseUrl } = appConfig;
  const [searchParams] = useSearchParams();
  const { translate } = useLanguages();
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
      <section className={styles.section}>
        <Heading className={styles.sectionHeading} level="2" size={'medium'}>
          {activeTasks.length === 1
            ? translate(TEXTS.statiske.paabegynt.oneActiveTaskHeading)
            : translate(TEXTS.statiske.paabegynt.activeTasksHeading, { amount: activeTasks.length })}
        </Heading>
        <BodyShort className={styles.sectionBody}>{translate(TEXTS.statiske.paabegynt.activeTasksBody)}</BodyShort>
        {activeTasks.map((task) => (
          <LinkPanel
            key={task.innsendingsId}
            className={styles.linkPanel}
            title={translate(TEXTS.statiske.paabegynt.continueTask)}
            href={`${baseUrl}${formUrl}?innsendingsId=${task.innsendingsId}${
              searchParams.toString() && `&${searchParams.toString()}`
            }`}
            body={`${translate(TEXTS.grensesnitt.mostRecentSave)} ${dateUtils.toLocaleDateAndTime(task.endretDato)}.`}
            icon={<DocPencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
          />
        ))}
        <LinkPanel
          className={styles.linkPanel}
          variant="secondary"
          href={`${baseUrl}${formUrl}?opprettNySoknad=true${searchParams.toString() && `&${searchParams.toString()}`}`}
          title={translate(TEXTS.statiske.paabegynt.startNewTask)}
          icon={<PencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
        />
      </section>
      {hasSubmitted && (
        <section className={styles.section}>
          <Heading className={styles.sectionHeading} level="2" size={'medium'}>
            {translate(TEXTS.statiske.paabegynt.sendAttachmentsHeading)}
          </Heading>
          <BodyShort className={styles.sectionBody}>
            {translate(TEXTS.statiske.paabegynt.sendAttachmentsBody)}
          </BodyShort>
          <LinkPanel
            className={styles.linkPanel}
            href={`/minside`}
            title={translate(TEXTS.statiske.paabegynt.sendAttachment)}
            icon={<FileExportIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
          />
        </section>
      )}
      <div className={styles.separator} />
      <div className="button-row">
        <Button
          variant="secondary"
          onClick={() => {
            window.location.assign('www.nav.no');
          }}
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
};

export default ActiveTasks;
