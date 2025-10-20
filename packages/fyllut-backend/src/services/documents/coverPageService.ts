import {
  FormPropertiesType,
  ForstesideRequestBody,
  forstesideUtils,
  I18nTranslationReplacements,
  NavFormType,
  Recipient,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { responseToError } from '../../utils/errorHandling';

interface CreatePdfProps {
  accessToken: string;
  form: NavFormType;
  submission: Submission;
  translate: (text: string, textReplacements?: I18nTranslationReplacements) => string;
  language: string;
  unitNumber?: string;
}

const createPdf = async (props: CreatePdfProps): Promise<any> => {
  const { accessToken, form, submission, language = 'nb-NO', unitNumber, translate } = props;

  const recipients = (await getRecipients(form?.properties)) ?? [];

  const body = forstesideUtils.genererFoerstesideData(form, submission, language, recipients, unitNumber, translate);

  const response = await createPdfRequest(accessToken, JSON.stringify(body));

  log(body, response);

  return {
    ...(response as object),
    navSkjemaId: body.navSkjemaId,
    overskriftstittel: body.overskriftstittel,
    spraakkode: body.spraakkode,
  };
};

const getRecipients = async (formProperties: FormPropertiesType): Promise<Recipient[] | undefined> => {
  const { formsApiUrl } = config;

  if (formProperties.mottaksadresseId) {
    const recipientsResponse = await fetch(`${formsApiUrl}/v1/recipients`, {
      method: 'GET',
      headers: {
        'x-correlation-id': correlator.getId() as string,
      },
    });
    if (!recipientsResponse.ok) {
      throw new Error('Failed to fetch recipients');
    }

    return (await recipientsResponse.json()) as Recipient[] | undefined;
  }
};

const createPdfRequest = async (accessToken: string, body?: BodyInit) => {
  const { skjemabyggingProxyUrl } = config;

  const response = await fetch(`${skjemabyggingProxyUrl}/foersteside`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'x-correlation-id': correlator.getId(),
    } as HeadersInit,
    body,
  });

  console.log('førsteside', response.ok);
  if (response.ok) {
    return response.json();
  }

  throw await responseToError(response, 'Feil ved generering av førsteside', true);
};

const log = (forsteside: ForstesideRequestBody, response: any) => {
  logger.info('Download cover page', {
    loepenummer: response.loepenummer,
    navSkjemaId: forsteside.navSkjemaId,
    tema: forsteside.tema,
    enhetsnummer: forsteside.enhetsnummer,
    spraakkode: forsteside.spraakkode,
  });
};

const coverPageService = {
  createPdf,
};

export default coverPageService;
