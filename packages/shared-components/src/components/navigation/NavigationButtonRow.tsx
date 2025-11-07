import { ReactNode } from 'react';
import ButtonRow from '../button/ButtonRow';
import { FieldsetErrorMessage } from '../error/FieldsetErrorMessage';

interface Props {
  nextButton?: ReactNode;
  previousButton?: ReactNode;
  saveButton?: ReactNode;
  cancelButton?: ReactNode;
  errorMessage?: string;
  floatLeft?: boolean;
}

const NavigationButtonRow = ({ nextButton, previousButton, saveButton, cancelButton, errorMessage }: Props) => {
  const twoElementsFirstRow = !!nextButton && !!previousButton;
  const twoElementsSecondRow = !!cancelButton && !!saveButton;

  return (
    <nav>
      <ButtonRow>
        {nextButton}
        {previousButton}
      </ButtonRow>
      {errorMessage && <FieldsetErrorMessage errorMessage={errorMessage} className="mb-4" />}
      <ButtonRow center={twoElementsFirstRow && !twoElementsSecondRow}>
        {cancelButton}
        {saveButton}
      </ButtonRow>
    </nav>
  );
};

export default NavigationButtonRow;
