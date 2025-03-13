import correlator from 'express-correlation-id';
import FormData from 'form-data';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { synchronousResponseToError } from '../../utils/errorHandling';
import fetchWithRetry from '../../utils/fetchWithRetry';

const { gotenbergUrl, gotenbergUrlEn } = config;

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
  // Add Gotenberg-specific options
  formData.append('pdfa', options.pdfa ? 'PDF/A-2b' : '');
  formData.append('pdfua', options.pdfua ? 'true' : '');
  formData.append('skipNetworkIdleEvent', 'false');

  const date = new Date();
  const formattedDate = formatPDFDate(date);
  const metadata = {
    Author: 'Nav',
    Creator: 'Nav',
    Subject: schema,
    CreationDate: formattedDate,
    ModDate: formattedDate,
    Title: title,
  };
  formData.append('metadata', `${JSON.stringify(metadata)}`);

  // Hvordan sette språk? En engelsk og en norsk Gotenberg installasjon?
  logger.info(`Skal kalle Gotenberg for å merge filer`);
  return await callGotenberg(language, '/forms/pdfengines/merge', formData);
};

const formatPDFDate = (date: Date) => {
  return date.toISOString().replace(/\.\d{3}Z$/, ''); // Removes milliseconds & Zulu time
};

// Generisk metode for kall til mot Gotenberg gitt rute og preparert FormData
export const callGotenberg = async (language: string, route: string, formData: FormData): Promise<any> => {
  const url = language.toLowerCase().startsWith('en') ? gotenbergUrlEn : gotenbergUrl;
  console.log(`Calling Gotenberg with url = ${url}/${route}`);

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
      console.log(`Response fra Gotenberg feilet`);
      const errorText = await gotenbergResponse.text();
      throw synchronousResponseToError(
        `Feil i responsdata fra Gotenberg på id "${correlator.getId()}"`,
        errorText,
        gotenbergResponse.status,
        gotenbergResponse.url,
        true,
      );
    }

    const pdfBuffer = await gotenbergResponse.arrayBuffer();
    console.log(`Returnerer fra callGotenberg`);
    return pdfBuffer;
  } catch (e) {
    logger.error(`Request to gotenberg pdf service failed with  ${e}`);
    throw e;
  }
};
