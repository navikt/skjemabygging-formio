export interface ServiceMetricContext<TService extends string = string, TMethod extends string = string> {
  service: TService;
  method: TMethod;
}

export interface ServiceMetrics<TService extends string = string, TMethod extends string = string> {
  onRequest: (context: ServiceMetricContext<TService, TMethod>) => void;
  onFailure: (context: ServiceMetricContext<TService, TMethod> & { error: unknown }) => void;
  startDuration: (context: ServiceMetricContext<TService, TMethod>) => (result: { error: boolean }) => void;
}

export const withMetrics = async <TResult, TService extends string, TMethod extends string>(
  metrics: ServiceMetrics<TService, TMethod>,
  context: ServiceMetricContext<TService, TMethod>,
  operation: () => Promise<TResult>,
): Promise<TResult> => {
  metrics.onRequest(context);
  const stop = metrics.startDuration(context);

  let errorOccurred = false;

  try {
    return await operation();
  } catch (error) {
    errorOccurred = true;
    metrics.onFailure({ ...context, error });
    throw error;
  } finally {
    stop({ error: errorOccurred });
  }
};
