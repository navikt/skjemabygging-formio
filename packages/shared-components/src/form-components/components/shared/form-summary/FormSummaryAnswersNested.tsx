import { FormSummary } from '@navikt/ds-react';
import makeStyles from '../../../../util/styles/jss/jss';

const useStyles = makeStyles({
  grey: {
    backgroundColor: 'var(--a-gray-50)',
    '& &': {
      backgroundColor: 'var(--a-surface-neutral-subtle)',
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
