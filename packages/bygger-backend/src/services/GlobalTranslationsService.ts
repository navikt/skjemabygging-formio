import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../fetchUtils';

export default class GlobalTranslationsService {
  readonly formsApiUrl: string;
  readonly globalTranslationsPath: string;

  constructor(formsApiUrl: string) {
    this.formsApiUrl = formsApiUrl;
    this.globalTranslationsPath = '/v1/global-translations';
  }

  createHeaders(accessToken?: string, revisionId?: number) {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(revisionId && { 'Formsapi-Entity-Revision': `${revisionId}` }),
    };
  }

  async get(): Promise<FormsApiGlobalTranslation[]> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.globalTranslationsPath}`, {
      headers: this.createHeaders(),
    });
    return response.data as FormsApiGlobalTranslation[];
  }

  async post(
    translation: Pick<FormsApiGlobalTranslation, 'key' | 'tag' | 'nb' | 'nn' | 'en'>,
    accessToken?: string,
  ): Promise<FormsApiGlobalTranslation> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.globalTranslationsPath}`, {
      method: 'POST',
      headers: this.createHeaders(accessToken),
      body: JSON.stringify(translation),
    });
    return response.data as FormsApiGlobalTranslation;
  }

  async put(
    id: string,
    body: Pick<FormsApiGlobalTranslation, 'nb' | 'nn' | 'en'>,
    revision: number,
    accessToken: string,
  ): Promise<FormsApiGlobalTranslation> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.globalTranslationsPath}/${id}`, {
      method: 'PUT',
      headers: this.createHeaders(accessToken, revision),
      body: JSON.stringify(body),
    });
    return response.data as FormsApiGlobalTranslation;
  }
}
