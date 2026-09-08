import { describe, expect, it } from 'vitest';
import { hasFyllutLegacyInput } from './fyllutLegacySubmission';

describe('hasFyllutLegacyInput', () => {
  it('recognizes populated flat legacy submission fields', () => {
    expect(hasFyllutLegacyInput({ fodselsnummerDNummerSoker: '12345678911' })).toBe(true);
    expect(hasFyllutLegacyInput({ gateadresseSoker: 'Testveien 1' })).toBe(true);
    expect(hasFyllutLegacyInput({ fornavnAvsender: 'Sender', etternavnAvsender: 'Person' })).toBe(true);
    expect(hasFyllutLegacyInput({ fornavnSoker: '', etternavnAvsender: '' })).toBe(false);
  });
});
