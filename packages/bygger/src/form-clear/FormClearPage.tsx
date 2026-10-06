import { BodyLong, Button, Checkbox, Heading, Link, LocalAlert, Table, Textarea } from '@navikt/ds-react';
import { FormClearJob, FormClearOptions, FormClearPreview } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { AppLayout } from '../components/AppLayout';
import { formClearApi, FormClearApiError } from './api';
import styles from './FormClearPage.module.css';

const jobStorageKey = 'form-clear-job-id';
type PreviewSnapshot = { options: FormClearOptions; result: FormClearPreview };

const FormClearPage = () => {
  const [keepTestForms, setKeepTestForms] = useState(true);
  const [keepLockedForms, setKeepLockedForms] = useState(true);
  const [keepFormPaths, setKeepFormPaths] = useState('');
  const [preview, setPreview] = useState<PreviewSnapshot>();
  const previewRequestId = useRef(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [jobId, setJobId] = useState(() => sessionStorage.getItem(jobStorageKey));
  const [job, setJob] = useState<FormClearJob>();
  const [cleanup, setCleanup] = useState<{ removed: string[]; failed: { path: string; error: string }[] }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const options: FormClearOptions = {
    keepTestForms,
    keepLockedForms,
    keepFormPaths: [
      ...new Set(
        keepFormPaths
          .split(/\r?\n|,/)
          .map((path) => path.trim())
          .filter(Boolean),
      ),
    ],
  };

  const resetPreview = () => {
    previewRequestId.current += 1;
    setPreview(undefined);
    setApproved(false);
    setPreviewLoading(false);
  };

  const requestPreview = async () => {
    const requestId = ++previewRequestId.current;
    const snapshot = options;
    setPreview(undefined);
    setApproved(false);
    setPreviewLoading(true);
    setError('');
    try {
      const result = await formClearApi.preview(snapshot);
      if (requestId === previewRequestId.current) {
        setPreview({ options: snapshot, result });
      }
    } catch {
      if (requestId === previewRequestId.current) {
        setError('Kunne ikke hente forhåndsvisning. Prøv igjen.');
      }
    } finally {
      if (requestId === previewRequestId.current) {
        setPreviewLoading(false);
      }
    }
  };

  const execute = async (action: () => Promise<void>, onError?: (error: unknown) => Promise<void> | void) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (error) {
      if (onError) {
        await onError(error);
      } else {
        setError('Handlingen mislyktes. Prøv igjen.');
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!jobId || job?.status === 'completed' || job?.status === 'failed') return;
    let active = true;
    const load = async () => {
      try {
        const next = await formClearApi.getJob(jobId);
        if (active) {
          setJob(next);
          setError('');
        }
      } catch {
        if (active) setError('Kunne ikke hente status. Sjekk forbindelsen eller last siden på nytt.');
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [jobId, job?.status]);

  const statusText = { pending: 'Venter', running: 'Pågår', completed: 'Fullført', failed: 'Feilet' };
  const outcomeText = { deleted: 'Slettet', kept: 'Beholdt', failed: 'Feilet' };

  return (
    <AppLayout>
      <main className={styles.page}>
        <Heading level="1" size="xlarge">
          Tøm skjemaer i preprod
        </Heading>
        <BodyLong>
          Preprod og preprod-alt deler samme forms-api-database. Endringene påvirker begge miljøene. Sletting kan ikke
          angres.
        </BodyLong>
        {error && (
          <LocalAlert status="error" className={styles.section} role="alert">
            <LocalAlert.Header>
              <LocalAlert.Title>En feil oppstod</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>{error}</LocalAlert.Content>
          </LocalAlert>
        )}
        {!jobId && (
          <section className={styles.section} aria-label="Velg skjemaer som skal beholdes">
            <Heading level="2" size="medium">
              Behold skjemaer
            </Heading>
            <Checkbox
              checked={keepTestForms}
              onChange={(event) => {
                setKeepTestForms(event.target.checked);
                resetPreview();
              }}
            >
              Behold testskjemaer
            </Checkbox>
            <Checkbox
              checked={keepLockedForms}
              onChange={(event) => {
                setKeepLockedForms(event.target.checked);
                resetPreview();
              }}
            >
              Behold låste skjemaer
            </Checkbox>
            <Textarea
              label="Andre skjemastier som skal beholdes"
              description="Skriv én skjemasti per linje."
              value={keepFormPaths}
              onChange={(event) => {
                setKeepFormPaths(event.target.value);
                resetPreview();
              }}
            />
            <div className={styles.controls}>
              <Button type="button" loading={previewLoading} onClick={() => void requestPreview()}>
                Vis forhåndsvisning
              </Button>
            </div>
            {preview && (
              <section className={styles.section} aria-label="Forhåndsvisning">
                <Heading level="2" size="medium">
                  Forhåndsvisning
                </Heading>
                <BodyLong>
                  {preview.result.toDelete.length} skjemaer slettes. {preview.result.kept.length} skjemaer beholdes.
                </BodyLong>
                <Heading level="3" size="small">
                  Slettes
                </Heading>
                <ul className={styles.paths}>
                  {preview.result.toDelete.map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
                <Heading level="3" size="small">
                  Beholdes
                </Heading>
                <ul className={styles.paths}>
                  {preview.result.kept.map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
                <Checkbox checked={approved} onChange={(event) => setApproved(event.target.checked)}>
                  Jeg bekrefter at skjemaene i listen slettes fra databasen som deles av preprod og preprod-alt.
                </Checkbox>
                {approved && (
                  <Button
                    type="button"
                    data-color="danger"
                    loading={busy}
                    onClick={() =>
                      void execute(
                        async () => {
                          const { jobId: id } = await formClearApi.start({
                            ...preview.options,
                            expectedToDelete: preview.result.toDelete,
                            expectedKept: preview.result.kept,
                          });
                          sessionStorage.setItem(jobStorageKey, id);
                          setJobId(id);
                        },
                        async (error) => {
                          if (error instanceof FormClearApiError && error.status === 409) {
                            try {
                              const activeJob = await formClearApi.getActiveJob();
                              sessionStorage.setItem(jobStorageKey, activeJob.jobId);
                              setJob(activeJob);
                              setJobId(activeJob.jobId);
                              resetPreview();
                            } catch (lookupError) {
                              if (lookupError instanceof FormClearApiError && lookupError.status === 404) {
                                resetPreview();
                                setError('Planen er endret. Hent en ny forhåndsvisning før du prøver igjen.');
                              } else {
                                setError('Kunne ikke kontrollere om en jobb allerede er startet. Prøv igjen.');
                              }
                            }
                          } else {
                            setError('Handlingen mislyktes. Prøv igjen.');
                          }
                        },
                      )
                    }
                  >
                    Start sletting
                  </Button>
                )}
              </section>
            )}
          </section>
        )}
        {jobId && (
          <section className={styles.section} aria-label="Status for sletting">
            <Heading level="2" size="medium">
              Slettestatus
            </Heading>
            <BodyLong>Jobb-ID: {jobId}</BodyLong>
            {job && (
              <>
                <div role="status" aria-live="polite">
                  {statusText[job.status]}. {job.processedCount} av {job.totalCount} behandlet. {job.deletedCount}{' '}
                  slettet, {job.keptCount} beholdt, {job.failedCount} feilet.
                </div>
                <Table className={styles.section}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">Skjemasti</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Feil</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {job.items.map((item) => (
                      <Table.Row key={item.path}>
                        <Table.HeaderCell scope="row" className={styles.paths}>
                          {item.path}
                        </Table.HeaderCell>
                        <Table.DataCell>{outcomeText[item.outcome]}</Table.DataCell>
                        <Table.DataCell>{item.error ?? ''}</Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
                {(job.status === 'completed' || job.status === 'failed') && (
                  <section className={styles.section} aria-label="Rydd publiserte filer">
                    <Heading level="3" size="small">
                      Publiserte filer
                    </Heading>
                    <BodyLong>
                      Rydd bort filer for skjemaer som ikke finnes i forms-api. Skjemaer som ble beholdt, berøres ikke.
                    </BodyLong>
                    <div className={styles.controls}>
                      <Button
                        type="button"
                        loading={busy}
                        onClick={() => void execute(async () => setCleanup(await formClearApi.cleanup()))}
                      >
                        Rydd publiserte filer
                      </Button>
                      <Link as={RouterLink} to="/bulk-publisering">
                        Gå til bulkpublisering
                      </Link>
                    </div>
                    {cleanup && (
                      <div role="status" className={styles.section}>
                        {cleanup.removed.length} skjemaer ryddet. {cleanup.failed.length} feilet.
                        {cleanup.failed.length > 0 && (
                          <ul>
                            {cleanup.failed.map(({ path, error }) => (
                              <li key={path}>
                                {path}: {error}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className={styles.controls}>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          sessionStorage.removeItem(jobStorageKey);
                          setJobId(null);
                          setJob(undefined);
                          setCleanup(undefined);
                          resetPreview();
                        }}
                      >
                        Start ny forhåndsvisning
                      </Button>
                    </div>
                  </section>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </AppLayout>
  );
};

export default FormClearPage;
