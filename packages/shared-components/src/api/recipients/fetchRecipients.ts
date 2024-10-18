import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';

export async function fetchRecipients(baseUrl = ''): Promise<Recipient[]> {
  return await fetch(`${baseUrl}/api/recipients`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return [];
  });
}
