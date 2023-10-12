import { Modal } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import UnpublishButton from './UnpublishButton';

Modal.setAppElement(document.createElement('div'));

describe('UnpublishButton', () => {
  const onUnpublish = vi.fn();
  const renderButton = (form?: NavFormType) => {
    if (!form) {
      form = {
        properties: { published: dateUtils.getIso8601String() },
      } as NavFormType;
    }
    render(<UnpublishButton onUnpublish={onUnpublish} form={form} />);
  };

  it('do not render button if not published', () => {
    renderButton({} as NavFormType);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders button', async () => {
    renderButton();
    expect(await screen.findByRole('button')).toBeInTheDocument();
  });

  it('click button', async () => {
    renderButton();
    const button = await screen.findByRole('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
