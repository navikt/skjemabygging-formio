import { Registry } from 'prom-client';
import { describe, expect, it } from 'vitest';
import { getOrCreateCounter, getOrCreateHistogram } from './prometheusMetrics';

describe('prometheusMetrics', () => {
  it('reuses an existing counter from the same registry', async () => {
    const registry = new Registry();
    const firstCounter = getOrCreateCounter(registry, {
      name: 'test_requests_total',
      help: 'Test requests',
    });
    const secondCounter = getOrCreateCounter(registry, {
      name: 'test_requests_total',
      help: 'Test requests',
    });

    firstCounter.inc();

    expect(secondCounter).toBe(firstCounter);
    expect(await registry.getMetricsAsJSON()).toHaveLength(1);
  });

  it('reuses an existing histogram from the same registry', async () => {
    const registry = new Registry();
    const firstHistogram = getOrCreateHistogram<'error'>(registry, {
      name: 'test_duration_seconds',
      help: 'Test duration',
      labelNames: ['error'],
      buckets: [0.1, 0.5, 1],
    });
    const secondHistogram = getOrCreateHistogram<'error'>(registry, {
      name: 'test_duration_seconds',
      help: 'Test duration',
      labelNames: ['error'],
      buckets: [0.1, 0.5, 1],
    });

    const stopTimer = firstHistogram.startTimer();
    stopTimer({ error: 'false' });

    expect(secondHistogram).toBe(firstHistogram);
    expect(await registry.getMetricsAsJSON()).toHaveLength(1);
  });
});
