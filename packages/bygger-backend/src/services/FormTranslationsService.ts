import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../fetchUtils';

export default class FormTranslationsService {
  readonly formsApiTranslationsUrl: string;
  readonly translationsPath: string;

  constructor(formsApiUrl: string) {
    this.formsApiTranslationsUrl = `${formsApiUrl}/v1/forms`;
    this.translationsPath = 'translations';
  }

  createHeaders(accessToken?: string, revisionId?: number) {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(revisionId && { 'Formsapi-Entity-Revision': `${revisionId}` }),
    };
  }

  async get(formPath: string): Promise<FormsApiFormTranslation[]> {
    const response = await fetchWithErrorHandling(
      `${this.formsApiTranslationsUrl}/${formPath}/${this.translationsPath}`,
      {
        headers: this.createHeaders(),
      },
    );
    return response.data as FormsApiFormTranslation[];
  }

  async post(
    formPath: string,
    translation: Pick<FormsApiFormTranslation, 'key' | 'nb' | 'nn' | 'en' | 'globalTranslationId'>,
    accessToken?: string,
  ): Promise<FormsApiFormTranslation> {
    const response = await fetchWithErrorHandling(
      `${this.formsApiTranslationsUrl}/${formPath}/${this.translationsPath}`,
      {
        method: 'POST',
        headers: this.createHeaders(accessToken),
        body: JSON.stringify(translation),
      },
    );
    return response.data as FormsApiFormTranslation;
  }

  async put(
    formPath: string,
    id: string,
    body: Pick<FormsApiFormTranslation, 'nb' | 'nn' | 'en' | 'globalTranslationId'>,
    revision: number,
    accessToken: string,
  ): Promise<FormsApiFormTranslation> {
    const response = await fetchWithErrorHandling(
      `${this.formsApiTranslationsUrl}/${formPath}/${this.translationsPath}/${id}`,
      {
        method: 'PUT',
        headers: this.createHeaders(accessToken, revision),
        body: JSON.stringify(body),
      },
    );
    return response.data as FormsApiFormTranslation;
  }
}
