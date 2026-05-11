import { Counter, Histogram, Registry } from 'prom-client';

const DEFAULT_OUTGOING_DURATION_BUCKETS = [0.7, 0.8, 0.9, 1.0, 1.2, 1.5, 2.0, 5.0, 15.0];

interface PrometheusMetricsConfig {
  appName: string;
  registry: Registry;
}

interface CounterMetricOptions<TLabel extends string = string> {
  name: string;
  help: string;
  labelNames?: readonly TLabel[];
}

interface HistogramMetricOptions<TLabel extends string = string> {
  name: string;
  help: string;
  labelNames?: readonly TLabel[];
  buckets?: number[];
}

const getOrCreateCounter = <TLabel extends string = string>(
  registry: Registry,
  options: CounterMetricOptions<TLabel>,
): Counter<TLabel> => {
  const metric = registry.getSingleMetric(options.name);

  if (metric) {
    return metric as Counter<TLabel>;
  }

  return new Counter({
    ...options,
    registers: [registry],
  });
};

const getOrCreateHistogram = <TLabel extends string = string>(
  registry: Registry,
  options: HistogramMetricOptions<TLabel>,
): Histogram<TLabel> => {
  const metric = registry.getSingleMetric(options.name);

  if (metric) {
    return metric as Histogram<TLabel>;
  }

  return new Histogram({
    ...options,
    registers: [registry],
  });
};

const createMetricName = (appName: string, suffix: string) => `${appName}_${suffix}`;

export { createMetricName, DEFAULT_OUTGOING_DURATION_BUCKETS, getOrCreateCounter, getOrCreateHistogram };
export type { PrometheusMetricsConfig };
