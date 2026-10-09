import { XMarkIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './DataGrid.module.css';

interface DataGridRowProps {
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  title: ReactNode;
}

const DataGridRow = ({ children, onRemove, removeLabel, title }: DataGridRowProps) => {
  const { translate } = useLanguage();

  return (
    <div className={styles.row}>
      <Heading level="3" size="small" className={styles.rowHeading}>
        {title}
      </Heading>
      <div className={styles.rowContent}>{children}</div>
      {onRemove && (
        <div className={styles.remove}>
          <Button type="button" variant="tertiary" size="small" icon={<XMarkIcon aria-hidden />} onClick={onRemove}>
            {translate(removeLabel || TEXTS.common.remove)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataGridRow;
