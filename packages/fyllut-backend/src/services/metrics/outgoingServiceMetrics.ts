import { ServiceMetrics } from '@navikt/skjemadigitalisering-shared-backend';
import { Counter } from 'prom-client';
import AppMetrics from '../AppMetrics';

interface CreateOutgoingServiceMetricsProps {
  requestCounter: Counter;
  failureCounter: Counter;
}

const createOutgoingServiceMetrics = (
  appMetrics: AppMetrics,
  props: CreateOutgoingServiceMetricsProps,
): ServiceMetrics<string, string> => ({
  onRequest: () => {
    props.requestCounter.inc();
  },
  onFailure: () => {
    props.failureCounter.inc();
  },
  startDuration: ({ service, method }) => {
    const stopTimer = appMetrics.outgoingRequestDuration.startTimer({
      service,
      method,
    });

    return ({ error }) => {
      stopTimer({ error: String(error) });
    };
  },
});

export default createOutgoingServiceMetrics;
