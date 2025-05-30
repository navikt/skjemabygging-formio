import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../fetchUtils';

export default class RecipientService {
  readonly formsApiUrl: string;
  readonly recipientsUrl: string;

  constructor(formsApiUrl: string) {
    this.formsApiUrl = formsApiUrl;
    this.recipientsUrl = '/v1/recipients';
  }

  createHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  async getAll(): Promise<Recipient[]> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}`, {
      headers: this.createHeaders(),
    });
    return response.data as Recipient[];
  }

  async get(recipientId: string): Promise<Recipient> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}/${recipientId}`, {
      headers: this.createHeaders(),
    });
    return response.data as Recipient;
  }

  async post(recipient: Recipient, accessToken?: string): Promise<Recipient> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}`, {
      method: 'POST',
      headers: this.createHeaders(accessToken),
      body: JSON.stringify(recipient),
    });
    return response.data as Recipient;
  }

  async put(recipientId: string, recipient: Recipient, accessToken?: string): Promise<Recipient> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}/${recipientId}`, {
      method: 'PUT',
      headers: this.createHeaders(accessToken),
      body: JSON.stringify(recipient),
    });
    return response.data as Recipient;
  }

  async delete(recipientId: string, accessToken?: string): Promise<void> {
    await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}/${recipientId}`, {
      method: 'DELETE',
      headers: this.createHeaders(accessToken),
    });
  }
}
