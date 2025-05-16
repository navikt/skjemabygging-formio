import { createMetadataObject } from './submissionMetadataUtils';

describe('submissionMetadataUtils', () => {
  describe('createMetadataObject', () => {
    it('should create metadata object from path', () => {
      const data = { data: [{ id: 1, label: 'Element 1' }] };
      const result = createMetadataObject('level1', data);

      expect(result).toEqual({
        level1: { data: [{ id: 1, label: 'Element 1' }] },
      });
    });

    it('should create a nested object from paths and data', () => {
      const data = { data: [{ id: 1, label: 'Element 1' }] };
      const result = createMetadataObject('level1.level2.level3', data);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: { data: [{ id: 1, label: 'Element 1' }] },
          },
        },
      });
    });

    it('should return undefined if no paths are provided', () => {
      const data = { data: [{ id: 1, label: 'Element 1' }] };
      expect(createMetadataObject(undefined, data)).toEqual(undefined);
      expect(createMetadataObject('', data)).toEqual(undefined);
    });
  });
});
