import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  submissionMethod: SubmissionMethod;
}

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '50rem',
    margin: '0 auto',
    padding: '1.5rem',
    background: '#fff',
    borderRadius: '0.25rem',
  },
});

const getDescription = (submissionMethod) => {
  if (submissionMethod === 'digital') {
    return 'digtalt';
  }
  if (submissionMethod === 'paper') {
    return 'på papir';
  }
  return 'på valgt måte';
};

const SubmissionMethodNotAllowed = ({ submissionMethod }: Props) => {
  const submissionMethodDescription = getDescription(submissionMethod);
  const styles = useStyles();
  return (
    <>
      <div className={styles.content}>
        <h1>Ugyldig innsendingsvalg</h1>
        <p>Det er dessverre ikke mulig å sende inn dette skjemaet {submissionMethodDescription}.</p>
      </div>
    </>
  );
};

export default SubmissionMethodNotAllowed;
