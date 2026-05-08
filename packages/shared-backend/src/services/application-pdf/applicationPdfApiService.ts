import { PdfFormData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

interface CreatePdfResponse {
  content: string;
}

interface CreatePdfProps {
  baseUrl: string;
  accessToken: string;
  body: PdfFormData;
}

const getPdfContent = (response: string | CreatePdfResponse) => {
  return typeof response === 'string' ? response : response.content;
};

const createPdf = async (props: CreatePdfProps) => {
  const { baseUrl, accessToken, body } = props;
  logger.info(`Create application pdf for ${body.skjemanummer ?? 'unknown form'}`);

  const response = await http.post<string | CreatePdfResponse>(`${baseUrl}/api/pdf/v3/opprett-pdf`, body, {
    accessToken,
    accept: 'application/pdf',
  });
  const pdf = getPdfContent(response);

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Could not create pdf');
  }

  return pdf;
};

const applicationPdfApiService = {
  createPdf,
};

export default applicationPdfApiService;
