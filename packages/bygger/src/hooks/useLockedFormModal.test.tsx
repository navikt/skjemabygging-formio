import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import useLockedFormModal from './useLockedFormModal';

const TestComponent = () => {
  const { openLockedFormModal, lockedFormModalContent } = useLockedFormModal({
    properties: { lockedFormReason: 'En god grunn' },
  } as NavFormType);
  return (
    <div>
      <button onClick={openLockedFormModal}>Open Modal</button>
      {lockedFormModalContent}
    </div>
  );
};

describe('useLockedFormModal', () => {
  test('modal is initially closed', () => {
    render(<TestComponent />);
    expect(screen.queryByText('Skjemaet er låst for redigering')).not.toBeVisible();
  });

  test('modal opens when openLockedFormModal is called', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Open Modal'));

    expect(screen.getByText('Skjemaet er låst for redigering')).toBeVisible();
    expect(screen.getByText('En god grunn')).toBeVisible();
  });

  test('modal closes when close button is clicked', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Open Modal'));
    fireEvent.click(screen.getByTitle('Lukk'));

    expect(screen.queryByText('Skjemaet er låst for redigering')).not.toBeVisible();
  });
});
