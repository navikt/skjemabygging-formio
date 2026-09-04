import { initializeSubmission } from './initializeSubmission';

describe('initializeSubmission', () => {
  it('keeps resumed answers and never overwrites them', () => {
    const result = initializeSubmission({
      resumedSubmission: { data: { name: 'Saved' } },
      prefillData: { name: 'Prefill', age: 30 },
    });
    expect(result.data.name).toBe('Saved');
    expect(result.data.age).toBe(30);
  });

  it('fills empty fields from prefill, then defaults', () => {
    const result = initializeSubmission({
      defaults: { country: 'NO', city: 'Oslo' },
      prefillData: { city: 'Bergen' },
    });
    expect(result.data.country).toBe('NO');
    expect(result.data.city).toBe('Bergen');
  });

  it('returns empty data when nothing provided', () => {
    expect(initializeSubmission({}).data).toEqual({});
  });
});
