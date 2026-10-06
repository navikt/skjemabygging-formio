import { Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';
import Alert from '../../components/alert/Alert';
import styles from './ReceiptPage.module.css';

interface Props {
  variant: 'success' | 'warning';
  heading: ReactNode;
  children: ReactNode;
}

const ReceiptAlert = ({ variant, heading, children }: Props) => (
  <>
    <Alert size="medium" variant={variant} className={styles.hideOnPrint}>
      <Heading level="2" spacing size="xsmall">
        {heading}
      </Heading>
      {children}
    </Alert>
    <div className={styles.printOnly}>
      <Heading level="2" spacing size="xsmall" className={styles.printAlertHeading}>
        {heading}
      </Heading>
      {children}
    </div>
  </>
);

export default ReceiptAlert;
