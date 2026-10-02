import assert from 'node:assert/strict';

const verifyEvidence = (snapshot, epoch, expected) => {
  assert(Object.keys(expected).length > 0, 'EVIDENCE_EMPTY_EXPECTATIONS');
  for (const key of ['epochId', 'testId', 'attempt']) {
    assert.equal(snapshot[key], epoch[key], `EVIDENCE_EPOCH_MISMATCH: ${key}`);
  }
  assert.deepEqual(snapshot.expected, expected, 'EVIDENCE_EXPECTATION_MISMATCH');
  assert(Array.isArray(snapshot.records), 'EVIDENCE_INVALID_RECORDS');
  const seen = new Set();
  for (const record of snapshot.records) {
    for (const key of ['epochId', 'testId', 'attempt']) {
      assert.equal(record[key], epoch[key], `EVIDENCE_EPOCH_MISMATCH: ${key}`);
    }
    assert(typeof record.requestId === 'string' && !seen.has(record.requestId), 'EVIDENCE_DUPLICATE_REQUEST');
    seen.add(record.requestId);
    if (!(record.routeId in expected)) continue;
    assert.equal(
      record.variantId,
      expected[record.routeId],
      `EVIDENCE_WRONG_VARIANT: ${record.routeId}:${record.variantId}`,
    );
    assert.equal(record.response, 'completed', `EVIDENCE_INCOMPLETE: ${record.routeId}`);
    assert.notEqual(
      record.validation,
      'failed',
      `EVIDENCE_BODY_MISMATCH: ${record.routeId}: ${record.mismatchPaths?.join(', ')}`,
    );
    assert.equal(record.validation, 'passed', `EVIDENCE_VALIDATION_NOT_RUN: ${record.routeId}`);
    assert.equal(record.status, 200, `EVIDENCE_RESPONSE_STATUS: ${record.routeId}`);
    assert.deepEqual(record.mismatchPaths, [], `EVIDENCE_BODY_MISMATCH: ${record.routeId}`);
  }
  for (const routeId of Object.keys(expected)) {
    assert(
      snapshot.records.some((record) => record.routeId === routeId),
      `EVIDENCE_MISSING_ROUTE: ${routeId}`,
    );
  }
};

export { verifyEvidence };
