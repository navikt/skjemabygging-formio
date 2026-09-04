import { DocPencilIcon, FileExportIcon, PencilIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading, LinkCard, Loader } from '@navikt/ds-react';
import { dateUtils, Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useFyllut } from '../context/fyllut/FyllutContext';
import { buildDigitalFormSearch } from '../draft/digitalDraftUtils';
import FormHeader from '../layout/FormHeader';
import { getExitUrl, getMyPageUrl } from '../navigation/navUrls';
import styles from './ActiveTasksPage.module.css';

interface Props {
  form: Form;
}

const getFormUrl = (baseUrl: string, formPath: string, path = '', search = '') =>
  `${baseUrl}/${formPath}${path}${search}`;

const ActiveTasksPage = ({ form }: Props) => {
  const { applications } = useRuntimeServices();
  const { search } = useLocation();
  const [activeTasks, setActiveTasks] = useState<Awaited<ReturnType<typeof applications.getActiveTasks>>>([]);
  const draftTasks = activeTasks
    .filter((task) => task.type === 'draft')
    .sort((a, b) => (b.modifiedAt < a.modifiedAt ? -1 : 1));
  const hasAttachmentTask = activeTasks.some((task) => task.type === 'attachment');
  const hasDraftTask = draftTasks.length > 0;
  const hasActiveTask = hasDraftTask || hasAttachmentTask;
  const { fyllutBaseUrl } = useFyllut();
  const { translate } = useLanguage();

  useEffect(() => {
    applications.getActiveTasks(form.skjemanummer ?? '').then(setActiveTasks);
  }, [applications, form.skjemanummer]);

  if (!hasActiveTask) {
    return <Loader title={translate(TEXTS.statiske.loading)} size="3xlarge" />;
  }

  const newDraftUrl = getFormUrl(
    fyllutBaseUrl,
    form.path,
    '',
    buildDigitalFormSearch(search, { forceMellomlagring: 'true' }),
  );

  return (
    <>
      <FormHeader form={form} />
      <div className={styles.content}>
        {hasDraftTask && (
          <section className={styles.section}>
            <Heading className={styles.heading} level="2" size="medium">
              {translate(
                draftTasks.length === 1
                  ? TEXTS.statiske.paabegynt.oneActiveTaskHeading
                  : TEXTS.statiske.paabegynt.activeTasksHeading,
                { amount: draftTasks.length },
              )}
            </Heading>
            <BodyShort className={styles.description}>{translate(TEXTS.statiske.paabegynt.activeTasksBody)}</BodyShort>
            <ul className={styles.cards}>
              {draftTasks.map((task) => (
                <li key={task.id}>
                  <LinkCard className={styles.card} data-color="brand-blue">
                    <LinkCard.Icon className={styles.icon}>
                      <DocPencilIcon aria-hidden fontSize="1.5rem" />
                    </LinkCard.Icon>
                    <LinkCard.Title>
                      <LinkCard.Anchor
                        href={getFormUrl(
                          fyllutBaseUrl,
                          form.path,
                          '/oppsummering',
                          buildDigitalFormSearch(search, { innsendingsId: task.id }),
                        )}
                      >
                        {translate(TEXTS.statiske.paabegynt.continueTask)}
                      </LinkCard.Anchor>
                    </LinkCard.Title>
                    <LinkCard.Description>
                      {`${translate(TEXTS.grensesnitt.mostRecentSave)} ${dateUtils.toLocaleDateAndTime(task.modifiedAt)}.`}
                    </LinkCard.Description>
                  </LinkCard>
                </li>
              ))}
              <li>
                <LinkCard className={`${styles.card} ${styles.startNew}`}>
                  <LinkCard.Icon className={styles.icon}>
                    <PencilIcon aria-hidden fontSize="1.5rem" />
                  </LinkCard.Icon>
                  <LinkCard.Title>
                    <LinkCard.Anchor href={newDraftUrl}>
                      {translate(TEXTS.statiske.paabegynt.startNewTask)}
                    </LinkCard.Anchor>
                  </LinkCard.Title>
                </LinkCard>
              </li>
            </ul>
          </section>
        )}
        {hasAttachmentTask && (
          <section className={styles.section}>
            <Heading className={styles.heading} level="2" size="medium">
              {translate(TEXTS.statiske.paabegynt.sendAttachmentsHeading)}
            </Heading>
            <BodyShort className={styles.description}>
              {translate(TEXTS.statiske.paabegynt.sendAttachmentsBody)}
            </BodyShort>
            <ul className={styles.cards}>
              <li>
                <LinkCard className={styles.card} data-color="brand-blue">
                  <LinkCard.Icon className={styles.icon}>
                    <FileExportIcon aria-hidden fontSize="1.5rem" />
                  </LinkCard.Icon>
                  <LinkCard.Title>
                    <LinkCard.Anchor href={getMyPageUrl(window.location.href)}>
                      {translate(TEXTS.statiske.paabegynt.sendAttachment)}
                    </LinkCard.Anchor>
                  </LinkCard.Title>
                </LinkCard>
              </li>
              {!hasDraftTask && (
                <li>
                  <LinkCard className={`${styles.card} ${styles.startNew}`}>
                    <LinkCard.Icon className={styles.icon}>
                      <PencilIcon aria-hidden fontSize="1.5rem" />
                    </LinkCard.Icon>
                    <LinkCard.Title>
                      <LinkCard.Anchor href={newDraftUrl}>
                        {translate(TEXTS.statiske.paabegynt.startNewTask)}
                      </LinkCard.Anchor>
                    </LinkCard.Title>
                  </LinkCard>
                </li>
              )}
            </ul>
          </section>
        )}
        <hr className={styles.separator} />
        <Button as="a" href={getExitUrl(window.location.href)} variant="secondary">
          {translate(TEXTS.grensesnitt.navigation.exit)}
        </Button>
      </div>
    </>
  );
};

export default ActiveTasksPage;
