import { PdfFormData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

interface CreatePdfProps {
  baseUrl: string;
  accessToken: string;
  body: PdfFormData;
}

const createPdf = async (props: CreatePdfProps) => {
  const { baseUrl, accessToken, body } = props;
  logger.info(`Create application pdf for ${body.skjemanummer ?? 'unknown form'}`);

  const pdf = await http.post<string>(`${baseUrl}/api/pdf/v3/opprett-pdf`, body, {
    accessToken,
    accept: 'application/pdf',
  });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Could not create pdf');
  }

  return pdf;
};

const applicationPdfApiService = {
  createPdf,
};

export default applicationPdfApiService;
