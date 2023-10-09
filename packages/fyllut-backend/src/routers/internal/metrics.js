import { appMetrics } from '../../services';

const metrics = {
  get: async (req, res, next) => {
    try {
      const { register } = appMetrics;
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (err) {
      res.status(500).end(err.message);
      next(err);
    }
  },
};

export default metrics;
