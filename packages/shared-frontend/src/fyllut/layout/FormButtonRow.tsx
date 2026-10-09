import { ReactNode } from 'react';
import styles from './FormButtonRow.module.css';
import { FormNextButton } from './FormNextButton';
import { FormPrevButton } from './FormPrevButton';

interface FormButtonRowProps {
  nextButton?: ReactNode;
  previousButton?: ReactNode;
  saveButton?: ReactNode;
  cancelButton?: ReactNode;
}

const FormButtonRow = ({ nextButton, previousButton, saveButton, cancelButton }: FormButtonRowProps) => {
  const hasFirstRow = !!nextButton || !!previousButton;
  const hasSecondRow = !!cancelButton || !!saveButton;
  const twoElementsFirstRow = !!nextButton && !!previousButton;
  const twoElementsSecondRow = !!cancelButton && !!saveButton;

  if (!hasFirstRow && !hasSecondRow) {
    return null;
  }

  return (
    <div>
      {hasFirstRow && (
        <div className={styles.row}>
          {nextButton}
          {previousButton}
        </div>
      )}
      {hasSecondRow && (
        <div className={`${styles.row} ${twoElementsFirstRow && !twoElementsSecondRow ? styles.center : ''}`}>
          {cancelButton}
          {saveButton}
        </div>
      )}
    </div>
  );
};

export { FormButtonRow, FormNextButton, FormPrevButton };
