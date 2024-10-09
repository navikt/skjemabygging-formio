import { fetchWithErrorHandling } from '../fetchUtils';

interface Recipient {
  recipientId?: string;
  name: string;
  poBoxAddress: string;
  postalCode: string;
  postalName: string;
  createdAt?: string;
  createdBy?: string;
  changedAt?: string;
  changedBy?: string;
}

export class RecipientService {
  readonly formsApiUrl: string;
  readonly recipientsUrl: string;

  constructor(formsApiUrl: string) {
    this.formsApiUrl = formsApiUrl;
    this.recipientsUrl = '/v1/recipients';
  }

  async getAll(): Promise<Recipient[]> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data as Recipient[];
  }

  async get(recipientId: string): Promise<Recipient> {
    const response = await fetchWithErrorHandling(`${this.formsApiUrl}${this.recipientsUrl}/${recipientId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data as Recipient;
  }
}
