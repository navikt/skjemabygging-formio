import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpResponseError } from '../../shared/http/http';
import activeTaskClient from './activeTaskClient';

describe('activeTaskClient', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds active tasks url with default query semantics', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await activeTaskClient.getActiveTasks({
      accessToken,
      baseUrl,
      skjemanummer: 'NAV123',
      soknadsTyper: ['soknad', 'ettersendelse'],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/frontend/v1/skjema/NAV123/soknader?soknadstyper=soknad,ettersendelse`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('supports overriding soknadsTyper', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await activeTaskClient.getActiveTasks({
      accessToken,
      baseUrl,
      skjemanummer: 'NAV123',
      soknadsTyper: ['soknad'],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/frontend/v1/skjema/NAV123/soknader?soknadstyper=soknad`,
      expect.anything(),
    );
  });

  it('throws HttpResponseError on active tasks failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('error body', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    await expect(
      activeTaskClient.getActiveTasks({
        accessToken,
        baseUrl,
        skjemanummer: 'NAV123',
        soknadsTyper: ['soknad', 'ettersendelse'],
      }),
    ).rejects.toBeInstanceOf(HttpResponseError);
  });

  it('builds activities url and includes x-innsendingsid when provided', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await activeTaskClient.getActivities({
      accessToken,
      activitiesPath: '/fyllUt/v1/aktiviteter',
      baseUrl,
      dagligreise: true,
      innsendingsId: 'abc-123',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/fyllUt/v1/aktiviteter?dagligreise=true`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'x-innsendingsid': 'abc-123',
        }),
      }),
    );
  });

  it('omits x-innsendingsid and defaults dagligreise to false', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await activeTaskClient.getActivities({
      accessToken,
      activitiesPath: '/fyllUt/v1/aktiviteter',
      baseUrl,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}/fyllUt/v1/aktiviteter?dagligreise=false`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.not.objectContaining({
          'x-innsendingsid': expect.anything(),
        }),
      }),
    );
  });

  it('throws HttpResponseError on activities failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('error body', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    await expect(
      activeTaskClient.getActivities({
        accessToken,
        activitiesPath: '/fyllUt/v1/aktiviteter',
        baseUrl,
      }),
    ).rejects.toBeInstanceOf(HttpResponseError);
  });
});
