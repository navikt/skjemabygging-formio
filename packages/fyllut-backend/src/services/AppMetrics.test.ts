import AppMetrics from './AppMetrics';

describe('AppMetrics', () => {
  it('initializes the static PDF paper submissions counter to zero', async () => {
    const appMetrics = new AppMetrics();

    try {
      const metric = await appMetrics.paperSubmissionsCounter.get();

      expect(metric.values).toContainEqual({
        labels: { source: 'statiskpdf' },
        value: 0,
      });
    } finally {
      appMetrics.register.clear();
    }
  });
});
