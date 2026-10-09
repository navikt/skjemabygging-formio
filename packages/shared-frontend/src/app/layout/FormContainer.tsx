import { ReactNode } from 'react';
import styles from './FormContainer.module.css';

interface Props {
  children: ReactNode;
}

const FormContainer = ({ children }: Props) => <div className={styles.container}>{children}</div>;

export { FormContainer };
