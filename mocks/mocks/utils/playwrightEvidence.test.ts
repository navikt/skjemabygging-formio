import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { describe, expect, it, vi } from 'vitest';
import { createEvidence, type Middleware } from './playwrightEvidence';

const identity = { epochId: 'epoch', testId: 'test', attempt: 0 };
const response = () => {
  const result: Parameters<Middleware>[1] & { send: ReturnType<typeof vi.fn> } = Object.assign(
    new ServerResponse(new IncomingMessage(new Socket())),
    {
      statusCode: 200,
      status: (code: number) => {
        result.statusCode = code;
        return result;
      },
      send: vi.fn(),
      set: () => result,
    },
  );
  return result;
};
const request = (path: string, owner = 'owner', epoch = 'epoch') =>
  Object.assign(new IncomingMessage(new Socket()), {
    path,
    method: path === '/snapshot' ? 'GET' : 'POST',
    headers: { 'x-playwright-epoch': epoch, 'x-playwright-owner': owner },
    body: { 'post-familie-pdf': 'success-tc07' },
    params: {},
  });

describe('immutable mock epoch evidence', () => {
  it('rejects concurrent owners, foreign epochs, stale leases and release without a snapshot', () => {
    const evidence = createEvidence(identity);
    const res = response();
    const control = (path: string, owner = 'owner', epoch = 'epoch') => {
      evidence.control(request(path, owner, epoch), res as Parameters<Middleware>[1], vi.fn());
      return res.statusCode;
    };
    expect(control('/claim', 'owner', 'old')).toBe(409);
    expect(control('/claim')).toBe(201);
    expect(control('/claim', 'other')).toBe(409);
    expect(control('/snapshot', 'other')).toBe(409);
    expect(control('/release')).toBe(409);
    expect(control('/snapshot')).toBe(200);
    expect(res.send).toHaveBeenLastCalledWith({
      ...identity,
      expected: { 'post-familie-pdf': 'success-tc07' },
      records: [],
    });
    expect(control('/release')).toBe(204);
    expect(control('/snapshot')).toBe(409);
    expect(control('/claim')).toBe(409);
  });

  it('records executed comparator results on the same request, without body values', () => {
    const mutable = { ...identity };
    const evidence = createEvidence(mutable);
    mutable.epochId = 'changed';
    const req = request('/claim');
    const res = response();
    evidence.control(req, res as Parameters<Middleware>[1], vi.fn());
    evidence.begin(req, res as Parameters<Middleware>[1], 'post-familie-pdf', 'success-tc07');
    evidence.reportValidation(req, ['bunntekst.lowerMiddle']);
    res.statusCode = 400;
    res.emit('finish');
    evidence.control(request('/snapshot'), res as Parameters<Middleware>[1], vi.fn());
    const snapshot = res.send.mock.lastCall?.[0];
    expect(snapshot.records).toEqual([
      {
        ...identity,
        requestId: expect.any(String),
        routeId: 'post-familie-pdf',
        variantId: 'success-tc07',
        status: 400,
        response: 'completed',
        validation: 'failed',
        mismatchPaths: ['bunntekst.lowerMiddle'],
      },
    ]);
    snapshot.records[0].validation = 'passed';
    evidence.control(request('/snapshot'), res as Parameters<Middleware>[1], vi.fn());
    expect(res.send.mock.lastCall?.[0].records[0].validation).toBe('failed');
  });

  it('distinguishes an aborted response from completed validation', () => {
    const evidence = createEvidence(identity);
    const req = request('/claim');
    const res = response();
    evidence.control(req, res as Parameters<Middleware>[1], vi.fn());
    evidence.begin(req, res as Parameters<Middleware>[1], 'post-familie-pdf', 'success');
    res.emit('close');
    evidence.control(request('/snapshot'), res as Parameters<Middleware>[1], vi.fn());
    expect(res.send.mock.lastCall?.[0].records[0]).toMatchObject({ response: 'aborted', validation: 'not-run' });
  });
});
