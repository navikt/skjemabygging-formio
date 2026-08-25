import { FormSummary } from '@navikt/ds-react';
import styles from './FormSummaryAnswersNested.module.css';

interface Props {
  children: React.ReactNode;
}

const FormSummaryAnswersNested = ({ children, ...rest }: Props) => (
  <FormSummary.Answers className={styles.grey} {...rest}>
    {children}
  </FormSummary.Answers>
);

export default FormSummaryAnswersNested;
