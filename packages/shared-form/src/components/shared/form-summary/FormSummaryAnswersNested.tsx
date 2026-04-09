import { FormSummary } from '@navikt/ds-react';
import makeStyles from '../../../../util/styles/jss/jss';

const useStyles = makeStyles({
  grey: {
    backgroundColor: 'var(--ax-neutral-100)',
    '& &': {
      backgroundColor: 'var(--ax-bg-neutral-soft)',
    },
  },
});

interface Props {
  children: React.ReactNode;
}

const FormSummaryAnswersNested = ({ children, ...rest }: Props) => {
  const styles = useStyles();

  return (
    <FormSummary.Answers className={styles.grey} {...rest}>
      {children}
    </FormSummary.Answers>
  );
};

export default FormSummaryAnswersNested;
