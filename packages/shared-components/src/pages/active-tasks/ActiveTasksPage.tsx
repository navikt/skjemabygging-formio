import { DocPencilIcon, FileExportIcon, PencilIcon } from '@navikt/aksel-icons';
import { BodyShort, Heading } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { getActiveTasks, Soknad } from '../../api/active-tasks/activeTasks';
import CancelButton from '../../components/button/navigation/cancel/CancelButton';
import LinkPanel from '../../components/linkPanel/LinkPanel';
import LoadingComponent from '../../components/loading/LoadingComponent';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/styles/jss/jss';

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

const ActiveTasksPage = () => {
  const appConfig = useAppConfig();
  const { baseUrl } = appConfig;
  const [searchParams] = useSearchParams();
  const { translate } = useLanguages();
  const [mellomlagringer, setMellomlagringer] = useState<Soknad[]>([]);
  const [hasEttersendelse, setHasEttersendelse] = useState(false);
  const hasMellomlagring = mellomlagringer.length > 0;
  const { form, setFormProgressVisible } = useForm();

  const styles = useStyles();

  useEffect(() => {
    setFormProgressVisible(false);
  }, [setFormProgressVisible]);

  useEffect(() => {
    const initialize = async () => {
      const response = await getActiveTasks(form, appConfig);
      setMellomlagringer(
        response
          .filter((task) => task.soknadstype === 'soknad')
          .sort((taskA, taskB) => (taskB.endretDato < taskA.endretDato ? -1 : 1)),
      );
      setHasEttersendelse(response.some((task) => task.soknadstype === 'ettersendelse'));
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
    return `${baseUrl}/${form.path}${path}${searchParamsAsString}`;
  };

  if (!(hasMellomlagring || hasEttersendelse)) {
    return <LoadingComponent />;
  }

  return (
    <div>
      {hasMellomlagring && (
        <section className={styles.section}>
          <Heading className={styles.sectionHeading} level="2" size={'medium'}>
            {mellomlagringer.length === 1
              ? translate(TEXTS.statiske.paabegynt.oneActiveTaskHeading)
              : translate(TEXTS.statiske.paabegynt.activeTasksHeading, { amount: mellomlagringer.length })}
          </Heading>
          <BodyShort className={styles.sectionBody}>{translate(TEXTS.statiske.paabegynt.activeTasksBody)}</BodyShort>
          {mellomlagringer.map((task) => (
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
            href={getUrl('', { forceMellomlagring: 'true', sub: 'digital' })}
            title={translate(TEXTS.statiske.paabegynt.startNewTask)}
            icon={<PencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
          />
        </section>
      )}
      {hasEttersendelse && (
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
          {!hasMellomlagring && (
            <LinkPanel
              className={styles.linkPanel}
              variant="secondary"
              href={getUrl('', { forceMellomlagring: 'true', sub: 'digital' })}
              title={translate(TEXTS.statiske.paabegynt.startNewTask)}
              icon={<PencilIcon className={styles.icon} fontSize="1.5rem" aria-hidden />}
            />
          )}
        </section>
      )}
      <div className={styles.separator} />
      <div className="button-row">
        <CancelButton variant="secondary" />
      </div>
    </div>
  );
};

export default ActiveTasksPage;
