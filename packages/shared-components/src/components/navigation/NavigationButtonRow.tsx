import clsx from 'clsx';
import { ReactNode } from 'react';

export function NavigationButtonRow({
  nextButton,
  previousButton,
  saveButton,
  cancelButton,
}: {
  nextButton?: ReactNode;
  previousButton?: ReactNode;
  saveButton?: ReactNode;
  cancelButton?: ReactNode;
}) {
  return (
    <nav>
      <div className="button-row">
        {nextButton}
        {previousButton}
      </div>

      <div
        className={clsx('button-row', {
          'button-row__center': nextButton && previousButton && (!saveButton || !cancelButton),
        })}
      >
        {cancelButton}
        {saveButton}
      </div>
    </nav>
  );
}
