import { Registry } from 'prom-client';
import { describe, expect, it } from 'vitest';
import { createCounterMetric, createDurationMetric, createHistogramMetric } from './metricService';

describe('metricService', () => {
  it('records counter metrics', async () => {
    const registry = new Registry();
    const counter = createCounterMetric(
      {
        appName: 'fyllut',
        registry,
      },
      {
        metricName: 'test_requests_total',
        help: 'Test requests',
      },
    );

    counter.increment();

    expect(await registry.metrics()).toContain('fyllut_test_requests_total 1');
  });

  it('supports labeled counters', async () => {
    const registry = new Registry();
    const counter = createCounterMetric<'source'>(
      {
        appName: 'fyllut',
        registry,
      },
      {
        metricName: 'paper_submissions_total',
        help: 'Paper submissions',
        labelNames: ['source'],
        zeroValues: [{ source: 'fyllUt' }, { source: 'ingen' }],
      },
    );

    counter.increment({ source: 'fyllUt' });

    expect(await registry.metrics()).toContain('fyllut_paper_submissions_total{source="fyllUt"} 1');
    expect(await registry.metrics()).toContain('fyllut_paper_submissions_total{source="ingen"} 0');
  });

  it('records duration metrics', async () => {
    const registry = new Registry();
    const duration = createDurationMetric(
      {
        appName: 'fyllut',
        registry,
      },
      {
        metricName: 'test_service_duration_seconds',
        help: 'Test duration',
      },
    );

    const timer = duration.start();
    timer.failure();

    expect(await registry.metrics()).toContain('fyllut_test_service_duration_seconds_count{error="true"} 1');
  });

  it('supports labeled duration metrics', async () => {
    const registry = new Registry();
    const duration = createDurationMetric<'type'>(
      {
        appName: 'fyllut',
        registry,
      },
      {
        metricName: 'upload_duration_seconds',
        help: 'Upload duration',
        labelNames: ['type'],
        zeroValues: [{ type: 'digital' }, { type: 'nologin' }],
      },
    );

    const timer = duration.start({ type: 'digital' });
    timer.success();

    expect(await registry.metrics()).toContain('fyllut_upload_duration_seconds_count{type="digital",error="false"} 1');
    expect(await registry.metrics()).toContain('fyllut_upload_duration_seconds_count{type="nologin",error="true"} 0');
  });

  it('supports labeled histograms', async () => {
    const registry = new Registry();
    const histogram = createHistogramMetric<'type' | 'error'>(
      {
        appName: 'fyllut',
        registry,
      },
      {
        metricName: 'upload_file_size_bytes',
        help: 'Upload file size',
        labelNames: ['type', 'error'],
        zeroValues: [
          { type: 'digital', error: 'false' },
          { type: 'digital', error: 'true' },
        ],
        buckets: [1, 10, 100],
      },
    );

    histogram.observe(42, { type: 'digital', error: 'false' });

    expect(await registry.metrics()).toContain('fyllut_upload_file_size_bytes_count{type="digital",error="false"} 1');
    expect(await registry.metrics()).toContain('fyllut_upload_file_size_bytes_count{type="digital",error="true"} 0');
  });
});
