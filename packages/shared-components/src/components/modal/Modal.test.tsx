import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  const onClose = vi.fn();
  beforeAll(() => {
    render(
      <Modal onClose={onClose} open={true} title="Test">
        Test
      </Modal>,
    );
  });

  it('renders modal and check that it work', async () => {
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Lukk modalvindu' }));
    expect(onClose).toBeCalled();
  });
});
