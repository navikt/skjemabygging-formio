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
    <nav style={{ marginBottom: '2rem' }}>
      <div className="button-row button-row--center">
        {nextButton}
        {previousButton}
      </div>

      <div className="button-row button-row__center" style={{ marginTop: '1rem' }}>
        {saveButton}
        {cancelButton}
      </div>
    </nav>
  );
}
