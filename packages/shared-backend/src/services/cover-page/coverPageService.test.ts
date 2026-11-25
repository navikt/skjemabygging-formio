import { CoverPageDownloadType, HttpResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { createCoverPageService } from './coverPageService';

const data: CoverPageDownloadType = {
  submissionType: 'PAPER',
  languageCode: 'nb',
  form: {
    skjemanummer: 'NAV 12.34-56',
    title: 'Test form',
    properties: { skjemanummer: 'NAV 12.34-56', tema: 'AAP', submissionTypes: ['PAPER'], subsequentSubmissionTypes: [] },
  },
  attachments: ['Attachment'],
};

describe('createCoverPageService', () => {
  const downloadCoverPage = vi.fn();
  const service = createCoverPageService({ baseUrl: 'http://proxy', client: { downloadCoverPage } });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('keeps a local cover page value error as BAD_REQUEST but hides upstream generator errors', async () => {
    await expect(service.downloadCoverPage({ data: { ...data, attachments: ['Attachment <1>'] } })).rejects.toMatchObject(
      { errorCode: 'BAD_REQUEST', message: 'Invalid value for cover page' },
    );
    expect(downloadCoverPage).not.toHaveBeenCalled();

    downloadCoverPage.mockRejectedValueOnce(new HttpResponseError('BAD_REQUEST', 'Upstream detail', 'generator-id'));
    await expect(service.downloadCoverPage({ data })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Unable to generate cover page',
      correlationId: 'generator-id',
    });
  });
});
