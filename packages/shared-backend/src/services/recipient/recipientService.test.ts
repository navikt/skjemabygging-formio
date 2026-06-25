import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import type { MockInstance } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRecipientService } from './recipientService';

describe('createRecipientService', () => {
  const baseUrl = 'http://forms-api.test';
  const recipients: Recipient[] = [
    {
      recipientId: 'recipient-1',
      name: 'Recipient 1',
      poBoxAddress: 'PO Box 1',
      postalCode: '0123',
      postalName: 'Oslo',
    },
  ];
  const recipient = recipients[0];

  const createService = () => createRecipientService({ baseUrl });

  const mockFetchResponse = (body: BodyInit, status: number, contentType: string) =>
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, {
        status,
        headers: {
          'Content-Type': contentType,
        },
      }),
    );

  const expectGetRequest = (fetchSpy: MockInstance<typeof fetch>, url: string) => {
    expect(fetchSpy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRecipient', () => {
    it('returns undefined without calling fetch when recipientId is missing', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      const service = createService();

      await expect(service.getRecipient({ recipientId: undefined })).resolves.toBeUndefined();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns undefined without calling fetch when recipientId is empty', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      const service = createService();

      await expect(service.getRecipient({ recipientId: '' })).resolves.toBeUndefined();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('gets a single recipient through the client endpoint', async () => {
      const fetchSpy = mockFetchResponse(JSON.stringify(recipient), 200, 'application/json');
      const service = createService();

      await expect(service.getRecipient({ recipientId: recipient.recipientId })).resolves.toEqual(recipient);
      expectGetRequest(fetchSpy, `${baseUrl}/v1/recipients/${recipient.recipientId}`);
    });

    it('maps json error responses from the client endpoint', async () => {
      mockFetchResponse(
        JSON.stringify({ message: 'Recipient not found', correlationId: 'corr-1' }),
        404,
        'application/json',
      );
      const service = createService();

      await expect(service.getRecipient({ recipientId: recipient.recipientId })).rejects.toMatchObject({
        errorCode: 'NOT_FOUND',
        message: 'Recipient not found',
        correlationId: 'corr-1',
      });
    });
  });

  describe('getRecipients', () => {
    it('gets all recipients through the client endpoint', async () => {
      const fetchSpy = mockFetchResponse(JSON.stringify(recipients), 200, 'application/json');
      const service = createService();

      await expect(service.getRecipients()).resolves.toEqual(recipients);
      expectGetRequest(fetchSpy, `${baseUrl}/v1/recipients`);
    });

    it('maps text error responses from the client endpoint', async () => {
      mockFetchResponse('Recipient service unavailable', 503, 'text/plain');
      const service = createService();

      await expect(service.getRecipients()).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Recipient service unavailable',
        correlationId: undefined,
      });
    });
  });
});
