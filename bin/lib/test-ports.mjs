import { isPortFree } from './managed-test-stack.mjs';

const defaultPortRange = [3440, 3499];
const validatePorts = (ports, count = 4) => {
  if (
    !Array.isArray(ports) ||
    ports.length !== count ||
    new Set(ports).size !== count ||
    !ports.every((port) => Number.isInteger(port) && port >= 1024 && port <= 65535)
  ) {
    throw new Error(`INVALID_TEST_PORTS: expected ${count} distinct ports between 1024 and 65535`);
  }
  return ports;
};

const validatePortRange = (range, count = 4) => {
  if (
    !Array.isArray(range) ||
    range.length !== 2 ||
    !range.every((port) => Number.isInteger(port) && port >= 1024 && port <= 65535) ||
    range[1] - range[0] + 1 < count ||
    range[1] - range[0] + 1 > 256
  ) {
    throw new Error(`INVALID_TEST_PORT_RANGE: expected ${count} to 256 ports`);
  }
  return range;
};

const selectPorts = async (count, { range = defaultPortRange, signal, probe = isPortFree, exclude = [] } = {}) => {
  validatePortRange(range, count);
  const ports = [];
  for (let port = range[0]; port <= range[1] && ports.length < count; port++) {
    signal?.throwIfAborted();
    if (!exclude.includes(port) && (await probe(port))) ports.push(port);
  }
  signal?.throwIfAborted();
  if (ports.length !== count) throw new Error(`TEST_PORT_RANGE_EXHAUSTED: ${range.join(':')}`);
  return ports;
};

const parsePorts = (value) => validatePorts(value.split(',').map(Number));
const parsePortRange = (value) => validatePortRange(value.split(':').map(Number));

export { defaultPortRange, parsePortRange, parsePorts, selectPorts, validatePortRange, validatePorts };
