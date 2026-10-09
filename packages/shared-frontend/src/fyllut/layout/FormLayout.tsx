import { ReactNode } from 'react';
import styles from './FormLayout.module.css';

interface Props {
  children: ReactNode;
}

const FormLayout = ({ children }: Props) => <div className={styles.container}>{children}</div>;

export default FormLayout;
