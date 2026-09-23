import {
  appMetrics,
  coverPageService,
  formService,
  mergeFileService,
  staticPdfService,
  translationService,
} from '../../../services';
import { mockNext, mockRequest, mockResponse } from '../../../test/requestTestHelpers';
import staticPdf from './staticPdf';

vi.mock('@navikt/skjemadigitalisering-shared-backend', () => ({
  correlator: {
    getId: vi.fn(),
  },
  requestUtil: {
    getAzureAccessToken: vi.fn((req) => req.headers?.AzureAccessToken),
    getMergePdfToken: vi.fn((req) => req.headers?.MergePdfToken),
    getStringParam: vi.fn((req, key) => req.params?.[key]),
  },
}));

vi.mock('../../../services', () => ({
  appMetrics: {
    paperSubmissionsCounter: {
      inc: vi.fn(),
    },
  },
  coverPageService: {
    downloadCoverPage: vi.fn(),
  },
  formService: {
    getForm: vi.fn(),
  },
  mergeFileService: {
    mergeFiles: vi.fn(),
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

  it('downloads static pdf when attachments are omitted from the request body', async () => {
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
      body: {},
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
          attachments: [],
        }),
      }),
    );
    expect(mergeFileService.mergeFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          files: ['cover-page-pdf', 'static-pdf'],
        }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith({ pdfBase64: 'merged-pdf' });
    expect(next).not.toHaveBeenCalled();
  });

  it('downloads only selected attachment PDFs for ettersending', async () => {
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
      ],
      properties: {
        skjemanummer: 'NAV 12.34-56',
        tema: 'TEST',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
      },
    });
    vi.mocked(translationService.createTranslate).mockResolvedValue((text) => text?.toString() ?? '');
    vi.mocked(coverPageService.downloadCoverPage).mockResolvedValue('cover-page-pdf');
    vi.mocked(staticPdfService.downloadPdf).mockResolvedValue('attachment-static-pdf');
    vi.mocked(mergeFileService.mergeFiles).mockResolvedValue('merged-pdf');
    const req = mockRequest({
      headers: {
        AzureAccessToken: 'azure-access-token',
        MergePdfToken: 'merge-pdf-token',
      },
      body: { type: 'ETTERSENDELSE', attachments: ['attachmentOne'] },
    });
    req.params = { formPath: 'nav123456', languageCode: 'nb' };
    const res = mockResponse();
    const next = mockNext();

    await staticPdf.downloadPdf(req, res, next);

    expect(coverPageService.downloadCoverPage).toHaveBeenCalledWith(
      expect.objectContaining({
        formNumber: 'NAV 12.34-56',
        data: expect.objectContaining({
          type: 'ETTERSENDELSE',
          attachments: ['Attachment one'],
        }),
      }),
    );
    expect(staticPdfService.downloadPdf).toHaveBeenCalledTimes(1);
    expect(staticPdfService.downloadPdf).toHaveBeenCalledWith({
      formPath: 'attachment-form-one',
      languageCode: 'nb',
    });
    expect(mergeFileService.mergeFiles).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          files: ['cover-page-pdf', 'attachment-static-pdf'],
        }),
      }),
    );
    expect(appMetrics.paperSubmissionsCounter.inc).toHaveBeenCalledWith({
      source: 'ettersending',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects ettersending without an attachment before downloading a cover page', async () => {
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
    const req = mockRequest({
      body: { type: 'ETTERSENDELSE', attachments: [] },
    });
    req.params = { formPath: 'nav123456', languageCode: 'nb' };
    const res = mockResponse();
    const next = mockNext();

    await staticPdf.downloadPdf(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'BAD_REQUEST' }));
    expect(coverPageService.downloadCoverPage).not.toHaveBeenCalled();
  });

  it('ignores missing attachment PDFs for ettersending', async () => {
    vi.mocked(formService.getForm).mockResolvedValue({
      skjemanummer: 'NAV 12.34-56',
      path: 'nav123456',
      title: 'Test form',
      components: [
        {
          key: 'attachmentOne',
          type: 'attachment',
          label: 'Attachment one',
          properties: { vedleggskjema: 'attachment-form-one' },
        },
      ],
      properties: {
        skjemanummer: 'NAV 12.34-56',
        tema: 'TEST',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
      },
    });
    vi.mocked(translationService.createTranslate).mockResolvedValue((text) => text?.toString() ?? '');
    vi.mocked(coverPageService.downloadCoverPage).mockResolvedValue('cover-page-pdf');
    vi.mocked(staticPdfService.downloadPdf).mockRejectedValue(new Error('Attachment unavailable'));
    const req = mockRequest({
      body: { type: 'ETTERSENDELSE', attachments: ['attachmentOne'] },
    });
    req.params = { formPath: 'nav123456', languageCode: 'nb' };
    const res = mockResponse();
    const next = mockNext();

    await staticPdf.downloadPdf(req, res, next);

    expect(mergeFileService.mergeFiles).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ pdfBase64: 'cover-page-pdf' });
    expect(appMetrics.paperSubmissionsCounter.inc).toHaveBeenCalledWith({
      source: 'ettersending',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns the cover page without merging when ettersending attachments have no static PDF form', async () => {
    vi.mocked(formService.getForm).mockResolvedValue({
      skjemanummer: 'NAV 12.34-56',
      path: 'nav123456',
      title: 'Test form',
      components: [
        {
          key: 'attachmentOne',
          type: 'attachment',
          label: 'Attachment one',
          properties: {},
        },
      ],
      properties: {
        skjemanummer: 'NAV 12.34-56',
        tema: 'TEST',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
      },
    });
    vi.mocked(translationService.createTranslate).mockResolvedValue((text) => text?.toString() ?? '');
    vi.mocked(coverPageService.downloadCoverPage).mockResolvedValue('cover-page-pdf');
    const req = mockRequest({
      body: { type: 'ETTERSENDELSE', attachments: ['attachmentOne'] },
    });
    req.params = { formPath: 'nav123456', languageCode: 'nb' };
    const res = mockResponse();
    const next = mockNext();

    await staticPdf.downloadPdf(req, res, next);

    expect(staticPdfService.downloadPdf).not.toHaveBeenCalled();
    expect(mergeFileService.mergeFiles).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ pdfBase64: 'cover-page-pdf' });
    expect(next).not.toHaveBeenCalled();
  });
});
