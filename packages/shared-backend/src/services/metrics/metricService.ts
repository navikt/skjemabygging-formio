import {
  DEFAULT_OUTGOING_DURATION_BUCKETS,
  PrometheusMetricsConfig,
  createMetricName,
  getOrCreateCounter,
  getOrCreateHistogram,
} from './prometheusMetrics';

type MetricLabels<TLabel extends string = never> = Record<TLabel, string>;

interface CounterMetric<TLabel extends string = never> {
  increment: (labels?: MetricLabels<TLabel>, value?: number) => void;
}

interface CreateCounterMetricOptions<TLabel extends string = never> {
  metricName: string;
  help: string;
  labelNames?: readonly TLabel[];
  zeroValues?: MetricLabels<TLabel>[];
}

interface DurationMetricTimer {
  success: () => void;
  failure: () => void;
}

interface DurationMetric<TLabel extends string = never> {
  start: (labels?: MetricLabels<TLabel>) => DurationMetricTimer;
}

interface CreateDurationMetricOptions<TLabel extends string = never> {
  metricName: string;
  help: string;
  labelNames?: readonly TLabel[];
  zeroValues?: MetricLabels<TLabel>[];
  buckets?: number[];
}

interface HistogramMetric<TLabel extends string = never> {
  observe: (value: number, labels?: MetricLabels<TLabel>) => void;
}

interface CreateHistogramMetricOptions<TLabel extends string = never> {
  metricName: string;
  help: string;
  labelNames?: readonly TLabel[];
  zeroValues?: MetricLabels<TLabel>[];
  buckets?: number[];
}

type MetricServiceConfig = PrometheusMetricsConfig;
const noopDurationMetricTimer: DurationMetricTimer = {
  failure: () => {},
  success: () => {},
};

const zeroMetricLabels = <TLabel extends string>(
  zeroValues: MetricLabels<TLabel>[] | undefined,
  callback: (labels: MetricLabels<TLabel>) => void,
) => {
  zeroValues?.forEach(callback);
};

const createCounterMetric = <TLabel extends string = never>(
  config: MetricServiceConfig | undefined,
  options: CreateCounterMetricOptions<TLabel>,
): CounterMetric<TLabel> => {
  if (!config) {
    return {
      increment: () => {},
    };
  }

  const counter = getOrCreateCounter<TLabel>(config.registry, {
    name: createMetricName(config.appName, options.metricName),
    help: options.help,
    labelNames: options.labelNames ?? [],
  });

  zeroMetricLabels(options.zeroValues, (labels) => {
    counter.inc(labels, 0);
  });

  return {
    increment: (labels, value = 1) => {
      if (labels) {
        counter.inc(labels, value);
        return;
      }

      counter.inc(value);
    },
  };
};

const createDurationMetric = <TLabel extends string = never>(
  config: MetricServiceConfig | undefined,
  options: CreateDurationMetricOptions<TLabel>,
): DurationMetric<TLabel> => {
  if (!config) {
    return {
      start: () => noopDurationMetricTimer,
    };
  }

  type DurationLabel = TLabel | 'error';
  type PrometheusDurationLabels = Partial<Record<DurationLabel, string | number>>;

  const duration = getOrCreateHistogram<DurationLabel>(config.registry, {
    name: createMetricName(config.appName, options.metricName),
    help: options.help,
    labelNames: [...(options.labelNames ?? []), 'error'] as readonly DurationLabel[],
    buckets: options.buckets ?? DEFAULT_OUTGOING_DURATION_BUCKETS,
  });

  const zeroValues = options.zeroValues ?? ([{}] as MetricLabels<TLabel>[]);
  zeroMetricLabels(zeroValues, (labels) => {
    duration.zero({ ...labels, error: 'false' } as MetricLabels<DurationLabel>);
    duration.zero({ ...labels, error: 'true' } as MetricLabels<DurationLabel>);
  });

  return {
    start: (labels) => {
      const stopTimer = labels ? duration.startTimer(labels as PrometheusDurationLabels) : duration.startTimer();

      return {
        failure: () => {
          stopTimer({ ...(labels ?? {}), error: 'true' } as PrometheusDurationLabels);
        },
        success: () => {
          stopTimer({ ...(labels ?? {}), error: 'false' } as PrometheusDurationLabels);
        },
      };
    },
  };
};

const createHistogramMetric = <TLabel extends string = never>(
  config: MetricServiceConfig | undefined,
  options: CreateHistogramMetricOptions<TLabel>,
): HistogramMetric<TLabel> => {
  if (!config) {
    return {
      observe: () => {},
    };
  }

  const histogram = getOrCreateHistogram<TLabel>(config.registry, {
    name: createMetricName(config.appName, options.metricName),
    help: options.help,
    labelNames: options.labelNames ?? [],
    buckets: options.buckets,
  });

  zeroMetricLabels(options.zeroValues, (labels) => {
    histogram.zero(labels);
  });

  return {
    observe: (value, labels) => {
      if (labels) {
        histogram.observe(labels, value);
        return;
      }

      histogram.observe(value);
    },
  };
};

export { createCounterMetric, createDurationMetric, createHistogramMetric };
export type { CounterMetric, DurationMetric, DurationMetricTimer, HistogramMetric, MetricLabels, MetricServiceConfig };
