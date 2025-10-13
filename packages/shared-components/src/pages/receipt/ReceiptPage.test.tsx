import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReceiptPage } from './ReceiptPage';

const navigateMock = vi.fn();

let mockSubmissionMethod: string | undefined;
let mockFormContext: { form?: { title: string; path: string }; submission?: any };
let mockSendInnContext: { soknadPdfBlob?: Blob; nologinToken?: string };
let mockLanguages: {
  translate: (textOrKey?: string, params?: Record<string, unknown>) => string;
  currentLanguage: string;
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual<object>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../context/config/configContext', () => ({
  useAppConfig: () => ({ submissionMethod: mockSubmissionMethod }),
}));

vi.mock('../../context/form/FormContext', () => ({
  useForm: () => mockFormContext,
}));

vi.mock('../../context/sendInn/sendInnContext', () => ({
  useSendInn: () => mockSendInnContext,
}));

vi.mock('../../context/languages', async () => {
  const actual = await vi.importActual<any>('../../context/languages');
  return {
    ...actual,
    useLanguages: () => mockLanguages,
  };
});

describe('ReceiptPage', () => {
  const baseForm = { title: 'Testskjema', path: 'testskjema' } as any;

  const createTranslate =
    () =>
    (textOrKey: string = '', params?: Record<string, unknown>) => {
      if (!textOrKey) {
        return '';
      }

      return Object.entries(params ?? {}).reduce((acc, [key, value]) => {
        return acc.replace(`{{${key}}}`, String(value));
      }, textOrKey);
    };

  beforeEach(() => {
    mockSubmissionMethod = 'digital';
    mockFormContext = { form: baseForm, submission: { attachments: [] } };
    mockSendInnContext = { soknadPdfBlob: undefined, nologinToken: 'token' };
    mockLanguages = { translate: createTranslate(), currentLanguage: 'nb-NO' };
    navigateMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('redirects to legitimation when nologin token is missing', async () => {
    mockSubmissionMethod = 'digitalnologin';
    mockSendInnContext = { soknadPdfBlob: undefined, nologinToken: undefined };

    const { container } = render(<ReceiptPage />);

    expect(container.firstChild).toBeNull();
    await waitFor(() => expect(navigateMock).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith(`/${baseForm.path}/legitimasjon`, { replace: true });
  });

  it('renders submitted documents and cleans up blob URLs', () => {
    const attachments = [
      {
        attachmentId: 'attachment-1',
        title: 'Vitnemål',
        files: [{ name: 'vitnemal.pdf' }, { name: 'vitnemal2.pdf' }],
      },
    ];

    mockFormContext = {
      form: baseForm,
      submission: {
        attachments,
      },
    };

    const pdfBlob = new Blob(['dummy'], { type: 'application/pdf' });
    mockSendInnContext = { soknadPdfBlob: pdfBlob, nologinToken: 'token' };

    const originalCreateDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    const originalRevokeDescriptor = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
    const createObjectURLMock = vi.fn(() => 'blob:http://local/test');
    const revokeObjectURLMock = vi.fn();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURLMock,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURLMock,
    });

    const { unmount } = render(<ReceiptPage />);

    expect(createObjectURLMock).toHaveBeenCalledWith(pdfBlob);
    expect(screen.getByRole('heading', { name: 'Søknaden er sendt inn' })).toBeInTheDocument();
    expect(screen.getByText('Vi har mottatt søknaden din.')).toBeInTheDocument();
    const downloadLink = screen.getByRole('link', { name: 'Last ned kopi' });
    expect(downloadLink).toHaveAttribute('href', 'blob:http://local/test');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/Vitnemål \(2 filer\)/)).toBeInTheDocument();

    unmount();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://local/test');

    if (originalCreateDescriptor) {
      Object.defineProperty(URL, 'createObjectURL', originalCreateDescriptor);
    } else {
      Reflect.deleteProperty(URL, 'createObjectURL');
    }

    if (originalRevokeDescriptor) {
      Object.defineProperty(URL, 'revokeObjectURL', originalRevokeDescriptor);
    } else {
      Reflect.deleteProperty(URL, 'revokeObjectURL');
    }
  });

  it('shows follow-up sections when attachments require additional submission', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-09T12:00:00Z'));

    mockFormContext = {
      form: { ...baseForm, properties: { ettersendelsesfrist: '14' } },
      submission: {
        attachments: [
          {
            attachmentId: 'att-1',
            title: 'Kopi av honnørkort',
            value: 'ettersender',
            additionalDocumentation: 'Sendes innen to uker.',
          },
          {
            attachmentId: 'att-2',
            title: 'Dokumentasjon av arbeid eller utdanning',
            value: 'andre',
            additionalDocumentation: 'Fastlege og arbeidsgiver.',
          },
        ],
      },
    };

    render(<ReceiptPage />);

    expect(screen.queryByText('Søknaden er sendt inn')).not.toBeInTheDocument();
    expect(screen.getByText('Dette må du ettersende:')).toBeInTheDocument();
    expect(screen.getByText(/Kopi av honnørkort/)).toBeInTheDocument();
    expect(screen.getByText('Sendes innen to uker.')).toBeInTheDocument();
    expect(screen.getByText('Dette har du svart at noen andre skal sende inn:')).toBeInTheDocument();
    expect(screen.getByText('Dokumentasjon av arbeid eller utdanning')).toBeInTheDocument();
    expect(screen.getByText('Fastlege og arbeidsgiver.')).toBeInTheDocument();
    expect(screen.getByText('Dokumentene må ettersendes innen 23.11.2025')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'nav.no/ettersende' })).toHaveAttribute(
      'href',
      'https://www.nav.no/ettersende',
    );
  });

  it('uses form attachment metadata when submission attachments are missing title', () => {
    mockFormContext = {
      form: {
        ...baseForm,
        components: [
          {
            type: 'panel',
            components: [
              {
                type: 'attachment',
                id: 'att-1',
                key: 'kopiAvHonnorkort',
                navId: 'att-1',
                label: 'Kopi av honnørkort',
                properties: {
                  vedleggstittel: 'Kopi av honnørkort',
                },
              },
              {
                type: 'attachment',
                id: 'att-2',
                key: 'dokumentasjonAvArbeid',
                navId: 'att-2',
                label: 'Dokumentasjon av arbeid',
                properties: {
                  vedleggstittel: 'Dokumentasjon av arbeid',
                },
              },
            ],
          },
        ],
      } as any,
      submission: {
        attachments: [
          {
            attachmentId: 'att-1',
            navId: 'att-1',
            value: 'leggerVedNaa',
            files: [{ name: 'vitnemal.pdf' }],
          },
          {
            attachmentId: 'att-2',
            navId: 'att-2',
            value: 'ettersender',
          },
        ],
      },
    };

    render(<ReceiptPage />);

    expect(screen.getByText(/Kopi av honnørkort/)).toBeInTheDocument();
    expect(screen.queryByText('att-1')).not.toBeInTheDocument();
    expect(screen.getByText('Dette må du ettersende:')).toBeInTheDocument();
    expect(screen.getByText(/Dokumentasjon av arbeid/)).toBeInTheDocument();
    expect(screen.queryByText('att-2')).not.toBeInTheDocument();
  });
});
