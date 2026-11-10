import { PlusIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import styles from './DataGrid.module.css';

interface DataGridProps {
  addLabel?: string;
  children: ReactNode;
  onAdd?: () => void;
}

const DataGrid = ({ addLabel, children, onAdd }: DataGridProps) => {
  const { translate } = useLanguage();
  const rowsRef = useRef<HTMLDivElement>(null);
  const addClickedRef = useRef(false);

  // The add button unmounts when the new row reaches the row limit; keep focus in the form instead of losing it.
  useEffect(() => {
    if (!addClickedRef.current) {
      return;
    }
    addClickedRef.current = false;
    if (!onAdd) {
      rowsRef.current?.lastElementChild
        ?.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])')
        ?.focus();
    }
  });

  const add = () => {
    addClickedRef.current = true;
    onAdd?.();
  };

  return (
    <>
      <div ref={rowsRef} className={styles.rows}>
        {children}
      </div>
      {onAdd && (
        <div className={styles.add}>
          <Button
            className={styles.addButton}
            type="button"
            variant="secondary"
            size="small"
            icon={<PlusIcon aria-hidden />}
            onClick={add}
          >
            {translate(addLabel || TEXTS.common.add)}
          </Button>
        </div>
      )}
    </>
  );
};

export default DataGrid;
