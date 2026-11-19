import { describe, expect, it } from 'vitest';
import { isValidEmailAddress } from './emailAddressUtils';

describe('isValidEmailAddress', () => {
  it.each([
    'ola@nav.no',
    'ola.nordmann@nav.no',
    "o'brien+skjema@nav.no",
    'OLA@NAV.NO',
    'ola@post.nav-test.no',
    'øyvind@nav.no',
    'ola@nåv.no',
    'ola@xn--nv-yia.no',
    `${'a'.repeat(64)}@nav.no`,
  ])('accepts %s', (value) => {
    expect(isValidEmailAddress(value)).toBe(true);
  });

  it.each([
    ['without @', 'ola.nav.no'],
    ['with more than one @', 'ola@kari@nav.no'],
    ['with nothing before @', '@nav.no'],
    ['with a dot first before @', '.ola@nav.no'],
    ['with a dot last before @', 'ola.@nav.no'],
    ['with two dots in a row before @', 'ola..nordmann@nav.no'],
    ['with a comma before @', 'ola,nordmann@nav.no'],
    ['with a parenthesis before @', 'ola(x)@nav.no'],
    ['with a space before @', 'ola nordmann@nav.no'],
    ['with a quoted part before @', '"ola nordmann"@nav.no'],
    ['without a dot after @', 'ola@nav'],
    ['with a dot last', 'ola@nav.no.'],
    ['with two dots in a row after @', 'ola@nav..no'],
    ['with a hyphen first in a domain label', 'ola@-nav.no'],
    ['with a hyphen last in a domain label', 'ola@nav-.no'],
    ['with an underscore after @', 'ola@nav_x.no'],
    ['with a top-level domain of only digits', 'ola@nav.123'],
    ['with an IP address', 'ola@[127.0.0.1]'],
    ['with a domain label longer than 63 characters', `ola@${'a'.repeat(64)}.no`],
    ['with more than 64 octets before @', `${'a'.repeat(65)}@nav.no`],
    ['with more than 64 octets before @ counted in UTF-8', `${'ø'.repeat(33)}@nav.no`],
    ['longer than 254 octets', `ola@${Array(51).fill('abcd').join('.')}.no`],
  ])('rejects an address %s', (_description, value) => {
    expect(isValidEmailAddress(value)).toBe(false);
  });
});
