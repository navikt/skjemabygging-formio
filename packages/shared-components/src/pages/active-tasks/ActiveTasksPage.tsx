import { DocPencilIcon, FileExportIcon, PencilIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { dateUtils, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getActiveTasks, Soknad } from '../../api/active-tasks/activeTasks';
import LinkPanel from '../../components/linkPanel/LinkPanel';
import LoadingComponent from '../../components/loading/LoadingComponent';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { formUtils } from '../../index';
import makeStyles from '../../util/styles/jss/jss';

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

const ActiveTasksPage = ({ form, formUrl }: Props) => {
  const appConfig = useAppConfig();
  const { baseUrl } = appConfig;
  const [searchParams] = useSearchParams();
  const { translate } = useLanguages();
  const [activeTasks, setActiveTasks] = useState<Soknad[]>([]);
  const [hasSubmittedTasks, setHasSubmittedTasks] = useState(false);
  const hasActiveTasks = activeTasks.length > 0;

  const styles = useStyles();

  useEffect(() => {
    const initialize = async () => {
      const response = await getActiveTasks(form, appConfig);
      setActiveTasks(response.filter((task) => task.soknadstype === 'soknad'));
      setHasSubmittedTasks(response.some((task) => task.soknadstype === 'ettersendelse'));
    };
    initialize();
  }, []);

  const getUrl = (path: string = '', additionalSearchParams: Record<string, string> | undefined = {}) => {
    const existingAndAdditionalSearchParams = new URLSearchParams({
      ...Object.fromEntries(searchParams),
      ...additionalSearchParams,
    });
    const searchParamsAsString =
      existingAndAdditionalSearchParams.toString() && `?${existingAndAdditionalSearchParams.toString()}`;
    return `${baseUrl}${formUrl}${path}${searchParamsAsString}`;
  };

  const urlToFirstPanel = getUrl(`/${formUtils.getPanelSlug(form, 0)}`, { forceMellomlagring: 'true', sub: 'digital' });

  if (!(hasActiveTasks || hasSubmittedTasks)) {
    return <LoadingComponent />;
  }

  return (
    <div>
      {hasActiveTasks && (
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
              href={getUrl('/oppsummering', { innsendingsId: task.innsendingsId, sub: 'digital' })}
              body={`${translate(TEXTS.grensesnitt.mostRecentSave)} ${dateUtils.toLocaleDateAndTime(task.endretDato)}.`}
              icon={<DocPencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
            />
          ))}
          <LinkPanel
            className={styles.linkPanel}
            variant="secondary"
            href={urlToFirstPanel}
            title={translate(TEXTS.statiske.paabegynt.startNewTask)}
            icon={<PencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
          />
        </section>
      )}
      {hasSubmittedTasks && (
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
          {!hasActiveTasks && (
            <LinkPanel
              className={styles.linkPanel}
              variant="secondary"
              href={urlToFirstPanel}
              title={translate(TEXTS.statiske.paabegynt.startNewTask)}
              icon={<PencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
            />
          )}
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

export default ActiveTasksPage;
