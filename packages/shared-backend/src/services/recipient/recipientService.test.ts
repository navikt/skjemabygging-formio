import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import { createRecipientService } from './recipientService';

describe('createRecipientService', () => {
  const baseUrl = 'http://forms-api';
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

  it('returns undefined when recipientId is missing', async () => {
    const client = {
      getRecipient: vi.fn(),
      getRecipients: vi.fn(),
    };
    const service = createRecipientService({ baseUrl, client });

    await expect(service.getRecipient({ recipientId: undefined })).resolves.toBeUndefined();
    expect(client.getRecipient).not.toHaveBeenCalled();
  });

  it('delegates getRecipient to the client', async () => {
    const client = {
      getRecipient: vi.fn().mockResolvedValue(recipient),
      getRecipients: vi.fn(),
    };
    const service = createRecipientService({ baseUrl, client });

    await expect(service.getRecipient({ recipientId: recipient.recipientId })).resolves.toEqual(recipient);
    expect(client.getRecipient).toHaveBeenCalledWith({ baseUrl, recipientId: recipient.recipientId });
  });

  it('delegates getRecipients to the client', async () => {
    const client = {
      getRecipient: vi.fn(),
      getRecipients: vi.fn().mockResolvedValue(recipients),
    };
    const service = createRecipientService({ baseUrl, client });

    await expect(service.getRecipients()).resolves.toEqual(recipients);
    expect(client.getRecipients).toHaveBeenCalledWith({ baseUrl });
  });
});
