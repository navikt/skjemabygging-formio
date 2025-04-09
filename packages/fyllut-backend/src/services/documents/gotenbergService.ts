import correlator from 'express-correlation-id';
import FormData from 'form-data';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { synchronousResponseToError } from '../../utils/errorHandling';
import fetchWithRetry from '../../utils/fetchWithRetry';

const { gotenbergUrl, gotenbergUrlEn } = config;
const useLibreOfficeRoute = false;

// Sette opp formdata til å merge en liste av PDFer
export const mergeFiles = async (
  schema: string,
  title: string,
  language: string,
  fileList: Buffer<ArrayBuffer>[],
  options: { pdfa: boolean; pdfua: boolean },
): Promise<any> => {
  const formData = new FormData();

  // Add the main content
  fileList.forEach((buffer, index) => {
    if (buffer != undefined && index != undefined) {
      formData.append('files', buffer, `file${index}.pdf`);
    }
  });

  if (options.pdfa) {
    formData.append('pdfa', 'PDF/A-2b');
  }
  if (options.pdfua) {
    formData.append('pdfua', 'true');
  }
  formData.append('skipNetworkIdleEvent', 'false');

  const date = new Date();
  const formattedDate = formatPDFDate(date);
  const metadata = {
    Author: 'Nav',
    Creator: 'Nav',
    Title: title,
    Subject: schema,
    CreationDate: formattedDate,
    ModDate: formattedDate,
  };
  formData.append('metadata', `${JSON.stringify(metadata)}`);

  if (useLibreOfficeRoute) {
    formData.append('merge', 'true');
    return await callGotenberg(language, '/forms/libreOffice/convert', formData);
  } else {
    return await callGotenberg(language, '/forms/pdfengines/merge', formData);
  }
};

const formatPDFDate = (date: Date) => {
  return date.toISOString().replace(/\.\d{3}Z$/, ''); // Removes milliseconds & Zulu time
};

// Generisk metode for kall til mot Gotenberg gitt rute og preparert FormData
export const callGotenberg = async (language: string = 'no', route: string, formData: FormData): Promise<any> => {
  const url = language.toLowerCase().startsWith('en') ? gotenbergUrlEn : gotenbergUrl;
  logger.debug(`Calling Gotenberg with url = ${url}${route}`);

  try {
    // Send the request to Gotenberg
    const gotenbergResponse = await fetchWithRetry(`${url}${route}`, {
      retry: 1,
      headers: {
        accept: 'application/pdf, text/plain',
        correlation_id: correlator.getId(),
      } as HeadersInit,
      method: 'POST',
      body: formData,
    });

    if (!gotenbergResponse.ok) {
      const errorText = await gotenbergResponse.text();
      throw synchronousResponseToError(
        `Feil i responsdata fra Gotenberg på id "${correlator.getId()}"`,
        errorText,
        gotenbergResponse.status,
        gotenbergResponse.url,
        true,
      );
    }

    return await gotenbergResponse.arrayBuffer();
  } catch (e) {
    logger.error(`Request to gotenberg pdf service failed with  ${e}`);
    throw e;
  }
};
