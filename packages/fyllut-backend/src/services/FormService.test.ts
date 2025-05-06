import { expect } from 'vitest';
import * as f from '../utils/forms';
import FormService from './FormService';

const formService = new FormService();
const fetchFromApiSpy = vi.spyOn(f, 'fetchFromApi').mockImplementation(() => Promise.resolve({}));

describe('FormService', () => {
  beforeEach(() => {
    fetchFromApiSpy.mockClear();
  });

  it('Allow formatted form number as formpath', async () => {
    await formService.loadForm('nav101010');
    expect(fetchFromApiSpy).toBeCalled();
  });

  it('Do not allow form number as formpath', async () => {
    await formService.loadForm('NAV 10.10.10');
    expect(fetchFromApiSpy).not.toBeCalled();
  });
});
