import clsx from 'clsx';
import { ReactNode } from 'react';

export function NavigationButtonRow({
  nextButton,
  previousButton,
  saveButton,
  cancelButton,
  floatLeft = false,
}: {
  nextButton?: ReactNode;
  previousButton?: ReactNode;
  saveButton?: ReactNode;
  cancelButton?: ReactNode;
  floatLeft?: boolean;
}) {
  return (
    <nav>
      <div
        className={clsx('button-row', {
          'button-row__center': !floatLeft,
        })}
      >
        {nextButton}
        {previousButton}
      </div>

      <div
        className={clsx('button-row', {
          'button-row__center': !floatLeft,
        })}
      >
        {cancelButton}
        {saveButton}
      </div>
    </nav>
  );
}
