import { appMetrics } from "../../services";

const metrics = {
  get: (req, res, next) => {
    try {
      const { register } = appMetrics;
      res.set("Content-Type", register.contentType);
      res.end(register.metrics());
    } catch (err) {
      res.status(500).end(err.message);
      next(err);
    }
  },
};

export default metrics;
