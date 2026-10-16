import { PlusIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './DataGrid.module.css';

interface DataGridProps {
  addLabel?: string;
  children: ReactNode;
  onAdd?: () => void;
}

const DataGrid = ({ addLabel, children, onAdd }: DataGridProps) => {
  const { translate } = useLanguage();

  return (
    <>
      <div className={styles.rows}>{children}</div>
      {onAdd && (
        <div className={styles.add}>
          <Button
            className={styles.addButton}
            type="button"
            variant="secondary"
            size="small"
            icon={<PlusIcon aria-hidden />}
            onClick={onAdd}
          >
            {translate(addLabel || TEXTS.common.add)}
          </Button>
        </div>
      )}
    </>
  );
};

export default DataGrid;
