import client from "prom-client";

const Registry = client.Registry;
const register = new Registry();
client.collectDefaultMetrics({ register });

const metrics = {
  get: (req, res, next) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(register.metrics());
    } catch (err) {
      res.status(500).end(err.message);
      next(err);
    }
  },
};

export default metrics;
