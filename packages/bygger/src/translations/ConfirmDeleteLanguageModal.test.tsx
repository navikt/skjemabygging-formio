import { render, screen, waitFor } from '@testing-library/react';
import ConfirmDeleteLanguageModal from './ConfirmDeleteLanguageModal';

const mockedCloseModal = vi.fn();
const mockedOnConfirm = vi.fn();

describe('ConfirmDeleteLanguageModal', () => {
  const renderModal = (language = 'Norsk', isGlobal = false) => {
    render(
      <ConfirmDeleteLanguageModal
        isOpen={true}
        closeModal={mockedCloseModal}
        onConfirm={mockedOnConfirm}
        language={language}
        isGlobal={isGlobal}
      />,
    );
  };

  beforeEach(() => {
    renderModal();
    vi.clearAllMocks();
  });

  describe("When 'Slett språk' is clicked", () => {
    it('calls onConfirm', async () => {
      await waitFor(() => screen.getByRole('button', { name: 'Slett språk' }).click());
      expect(mockedOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('When "Avbryt" is clocked', () => {
    it('calls closeModal', () => {
      screen.getByRole('button', { name: 'Avbryt' }).click();
      expect(mockedCloseModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('When modal is used with isGlobal flag being true', () => {
    beforeEach(() => {
      renderModal('Norsk', true);
    });

    it('displays text for global translations, with language in lowercase', () => {
      const modalText = screen.queryByText(
        'Ved å klikke på "slett språk" fjerner du alle oversettelser til norsk for dette skjemaet, for godt. Denne handlingen kan ikke angres.',
      );
      expect(modalText).toBeDefined();
    });
  });

  describe('When modal is used with isGlobal flag being false', () => {
    beforeEach(() => {
      renderModal('Svensk', true);
    });

    it('displays text for form translations, with language in lowercase', () => {
      const modalText = screen.queryByText(
        `Ved å klikke på "slett språk" fjerner du alle oversettelser til "svensk" for dette skjemaet, for godt. Denne handlingen kan ikke angres.`,
      );
      expect(modalText).toBeDefined();
    });
  });
});
