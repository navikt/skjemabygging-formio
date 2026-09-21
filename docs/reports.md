# Report follow-up

## First publication date

The remaining work requires an authoritative forms-api contract for the first publication date. The contract must
define:

- when the date is first set
- how existing published forms receive a historical date
- who may correct the date manually
- how the builder reads and updates the date

When the contract is available, the builder must display the date, support approved manual corrections and include
the value in the existing report column. Missing historical values must remain empty instead of being replaced with
the latest publication date or today's date.

## Pagination

Pagination or batch endpoints may be added later if measured report volume requires it. This is independent of the
first-publication contract.
