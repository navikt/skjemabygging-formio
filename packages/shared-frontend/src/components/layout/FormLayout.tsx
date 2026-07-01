import { ReactNode } from 'react';
import styles from './FormLayout.module.css';

interface Props {
  children: ReactNode;
}

/**
 * Centred, max-width container matching the old shared-components FormContainer design.
 * maxWidth 640px, auto horizontal margins, responsive padding.
 */
const FormLayout = ({ children }: Props) => <div className={styles.container}>{children}</div>;

export default FormLayout;
