import { Component, Submission } from '../../models';
import { submissionPathUtils } from './submissionPathUtils';

describe('submissionPathUtils', () => {
  describe('getSubmissionValue', () => {
    const submission: Submission = {
      data: {
        field1: 'value1',
        field2: {
          subfield: 'value2',
        },
        field3: 3,
        field4: 0,
        arrayField: [{ item: 'item0' }, { item: 'item1' }],
        emptyField: '',
        emptyObject: {},
      },
    } as Submission;

    it('returns value for simple path', () => {
      expect(submissionPathUtils.getSubmissionValue('field1', submission)).toBe('value1');
    });

    it('returns value for simple path with number', () => {
      expect(submissionPathUtils.getSubmissionValue('field3', submission)).toBe(3);
    });

    it('returns value for simple path with number 0', () => {
      expect(submissionPathUtils.getSubmissionValue('field4', submission)).toBe(0);
    });

    it('returns value for nested path', () => {
      expect(submissionPathUtils.getSubmissionValue('field2.subfield', submission)).toBe('value2');
    });

    it('returns value for array path', () => {
      expect(submissionPathUtils.getSubmissionValue('arrayField[1].item', submission)).toBe('item1');
    });

    it('returns undefined for empty string or empty object', () => {
      expect(submissionPathUtils.getSubmissionValue('emptyField', submission)).toBeUndefined();
      expect(submissionPathUtils.getSubmissionValue('emptyObject', submission)).toBeUndefined();
    });

    it('returns undefined for non-existing path', () => {
      expect(submissionPathUtils.getSubmissionValue('doesNotExist', submission)).toBeUndefined();
    });

    it('returns undefined if submission or path is missing', () => {
      expect(submissionPathUtils.getSubmissionValue('field1')).toBeUndefined();
      expect(submissionPathUtils.getSubmissionValue('', submission)).toBeUndefined();
    });
  });

  describe('noChildValues', () => {
    const submission: Submission = {
      data: {
        parent: {
          child1: 'value',
        },
      },
    } as Submission;

    const components: Component[] = [
      { key: 'child1', input: true } as Component,
      { key: 'child2', input: true } as Component,
    ];

    it('returns false if any child has value', () => {
      expect(submissionPathUtils.noChildValues('parent', components, submission)).toBe(false);
    });

    it('returns true if no children have values', () => {
      const emptySubmission: Submission = { data: { parent: {} } } as Submission;
      expect(submissionPathUtils.noChildValues('parent', components, emptySubmission)).toBe(true);
    });

    it('returns true if components are missing or empty', () => {
      expect(submissionPathUtils.noChildValues('parent', undefined, submission)).toBe(true);
      expect(submissionPathUtils.noChildValues('parent', [], submission)).toBe(true);
    });

    it('returns true if submission is missing', () => {
      expect(submissionPathUtils.noChildValues('parent', components, undefined)).toBe(true);
    });
  });

  describe('noChildValuesForDataGrid', () => {
    const submission: Submission = {
      data: {
        grid: [{ child1: 'a' }, { child1: '' }],
      },
    } as Submission;

    const components: Component[] = [{ key: 'child1', input: true } as Component];

    it('returns false if any row has child value', () => {
      expect(submissionPathUtils.noChildValuesForDataGrid('grid', components, submission)).toBe(false);
    });

    it('returns true if all rows have no child values', () => {
      const emptySubmission: Submission = { data: { grid: [{}, {}] } } as Submission;
      expect(submissionPathUtils.noChildValuesForDataGrid('grid', components, emptySubmission)).toBe(true);
    });

    it('returns true if grid is empty or missing', () => {
      const emptySubmission: Submission = { data: { grid: [] } } as Submission;
      expect(submissionPathUtils.noChildValuesForDataGrid('grid', components, emptySubmission)).toBe(true);
      expect(submissionPathUtils.noChildValuesForDataGrid('grid', components, undefined)).toBe(true);
    });
  });

  describe('getComponentSubmissionPath', () => {
    it('returns correct path for input/tree', () => {
      const component: Component = { key: 'child', input: true } as Component;
      expect(submissionPathUtils.getComponentSubmissionPath(component, 'parent')).toBe('parent.child');
    });

    it('returns key if no parent path', () => {
      const component: Component = { key: 'child', input: true } as Component;
      expect(submissionPathUtils.getComponentSubmissionPath(component, '')).toBe('child');
    });

    it('returns parent path if not input/tree', () => {
      const component: Component = { key: 'child', input: false, tree: false } as Component;
      expect(submissionPathUtils.getComponentSubmissionPath(component, 'parent')).toBe('parent');
    });
  });
});
