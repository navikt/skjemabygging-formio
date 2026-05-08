import {
  coverPageService,
  formService,
  mergeFileService,
  staticPdfService,
  translationService,
} from '@navikt/skjemadigitalisering-shared-backend';
import { mockNext, mockRequest, mockResponse } from '../../../test/requestTestHelpers';
import staticPdf from './staticPdf';

vi.mock('@navikt/skjemadigitalisering-shared-backend', () => ({
  coverPageService: {
    downloadCoverPage: vi.fn(),
  },
  correlator: {
    getId: vi.fn(),
  },
  formService: {
    getForm: vi.fn(),
  },
  mergeFileService: {
    mergeFiles: vi.fn(),
  },
  requestUtil: {
    getStringParam: vi.fn((req, key) => req.params?.[key]),
  },
  staticPdfService: {
    downloadPdf: vi.fn(),
    getAll: vi.fn(),
  },
  translationService: {
    createTranslate: vi.fn(),
  },
}));

describe('[endpoint] staticPdf', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds p suffix to the first form number token before downloading cover page', async () => {
    vi.mocked(formService.getForm).mockResolvedValue({
      skjemanummer: 'NAV 12.34-56',
      path: 'nav123456',
      title: 'Test form',
      components: [],
      properties: {
        skjemanummer: 'NAV 12.34-56',
        tema: 'TEST',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
      },
    });
    vi.mocked(translationService.createTranslate).mockResolvedValue((text) => text?.toString() ?? '');
    vi.mocked(coverPageService.downloadCoverPage).mockResolvedValue('cover-page-pdf');
    vi.mocked(staticPdfService.downloadPdf).mockResolvedValue('static-pdf');
    vi.mocked(mergeFileService.mergeFiles).mockResolvedValue('merged-pdf');

    const req = mockRequest({
      headers: {
        AzureAccessToken: 'azure-access-token',
        MergePdfToken: 'merge-pdf-token',
      },
      body: {
        attachments: [],
      },
    });
    req.params = {
      formPath: 'nav123456',
      languageCode: 'nb',
    };

    const res = mockResponse();
    const next = mockNext();

    await staticPdf.downloadPdf(req, res, next);

    expect(coverPageService.downloadCoverPage).toHaveBeenCalledWith(
      expect.objectContaining({
        formNumber: 'NAVp 12.34-56',
      }),
    );
    expect(res.json).toHaveBeenCalledWith({ pdfBase64: 'merged-pdf' });
    expect(next).not.toHaveBeenCalled();
  });

  it('uses attachment labels instead of attachment keys on the cover page for static pdfs', async () => {
    vi.mocked(formService.getForm).mockResolvedValue({
      skjemanummer: 'NAV 12.34-56',
      path: 'nav123456',
      title: 'Test form',
      components: [
        {
          key: 'attachmentOne',
          type: 'attachment',
          label: 'Attachment one',
          properties: {
            vedleggskjema: 'attachment-form-one',
          },
        },
        {
          key: 'attachmentTwo',
          type: 'attachment',
          label: 'Attachment two',
          properties: {
            vedleggskjema: 'attachment-form-two',
          },
        },
      ],
      properties: {
        skjemanummer: 'NAV 12.34-56',
        tema: 'TEST',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
      },
    });
    vi.mocked(translationService.createTranslate).mockResolvedValue((text) => `translated:${text?.toString() ?? ''}`);
    vi.mocked(coverPageService.downloadCoverPage).mockResolvedValue('cover-page-pdf');
    vi.mocked(staticPdfService.downloadPdf)
      .mockResolvedValueOnce('static-pdf')
      .mockResolvedValueOnce('attachment-static-pdf-one')
      .mockResolvedValueOnce('attachment-static-pdf-two');
    vi.mocked(mergeFileService.mergeFiles).mockResolvedValue('merged-pdf');

    const req = mockRequest({
      headers: {
        AzureAccessToken: 'azure-access-token',
        MergePdfToken: 'merge-pdf-token',
      },
      body: {
        attachments: ['attachmentTwo', 'attachmentOne'],
      },
    });
    req.params = {
      formPath: 'nav123456',
      languageCode: 'nb',
    };

    const res = mockResponse();
    const next = mockNext();

    await staticPdf.downloadPdf(req, res, next);

    expect(coverPageService.downloadCoverPage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attachments: ['translated:Attachment two', 'translated:Attachment one'],
        }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
