import { FormSummary } from '@navikt/ds-react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
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
