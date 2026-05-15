import { Component } from '../../models/form/component';
import { Submission } from '../../models/form/submission';
import { submissionUtils } from './submissionUtils';

describe('submissionUtils', () => {
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
      expect(submissionUtils.getSubmissionValue('field1', submission)).toBe('value1');
    });

    it('returns value for simple path with number', () => {
      expect(submissionUtils.getSubmissionValue('field3', submission)).toBe(3);
    });

    it('returns value for simple path with number 0', () => {
      expect(submissionUtils.getSubmissionValue('field4', submission)).toBe(0);
    });

    it('returns value for nested path', () => {
      expect(submissionUtils.getSubmissionValue('field2.subfield', submission)).toBe('value2');
    });

    it('returns value for array path', () => {
      expect(submissionUtils.getSubmissionValue('arrayField[1].item', submission)).toBe('item1');
    });

    it('returns undefined for empty string or empty object', () => {
      expect(submissionUtils.getSubmissionValue('emptyField', submission)).toBeUndefined();
      expect(submissionUtils.getSubmissionValue('emptyObject', submission)).toBeUndefined();
    });

    it('returns undefined for non-existing path', () => {
      expect(submissionUtils.getSubmissionValue('doesNotExist', submission)).toBeUndefined();
    });

    it('returns undefined if submission or path is missing', () => {
      expect(submissionUtils.getSubmissionValue('field1')).toBeUndefined();
      expect(submissionUtils.getSubmissionValue('', submission)).toBeUndefined();
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
      expect(submissionUtils.noChildValues('parent', components, submission)).toBe(false);
    });

    it('returns true if no children have values', () => {
      const emptySubmission: Submission = { data: { parent: {} } } as Submission;
      expect(submissionUtils.noChildValues('parent', components, emptySubmission)).toBe(true);
    });

    it('returns true if components are missing or empty', () => {
      expect(submissionUtils.noChildValues('parent', undefined, submission)).toBe(true);
      expect(submissionUtils.noChildValues('parent', [], submission)).toBe(true);
    });

    it('returns true if submission is missing', () => {
      expect(submissionUtils.noChildValues('parent', components, undefined)).toBe(true);
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
      expect(submissionUtils.noChildValuesForDataGrid('grid', components, submission)).toBe(false);
    });

    it('returns true if all rows have no child values', () => {
      const emptySubmission: Submission = { data: { grid: [{}, {}] } } as Submission;
      expect(submissionUtils.noChildValuesForDataGrid('grid', components, emptySubmission)).toBe(true);
    });

    it('returns true if grid is empty or missing', () => {
      const emptySubmission: Submission = { data: { grid: [] } } as Submission;
      expect(submissionUtils.noChildValuesForDataGrid('grid', components, emptySubmission)).toBe(true);
      expect(submissionUtils.noChildValuesForDataGrid('grid', components, undefined)).toBe(true);
    });
  });

  describe('getComponentSubmissionPath', () => {
    it('returns correct path for input/tree', () => {
      const component: Component = { key: 'child', input: true } as Component;
      expect(submissionUtils.getComponentSubmissionPath(component, 'parent')).toBe('parent.child');
    });

    it('returns key if no parent path', () => {
      const component: Component = { key: 'child', input: true } as Component;
      expect(submissionUtils.getComponentSubmissionPath(component, '')).toBe('child');
    });

    it('returns parent path if not input/tree', () => {
      const component: Component = { key: 'child', input: false, tree: false } as Component;
      expect(submissionUtils.getComponentSubmissionPath(component, 'parent')).toBe('parent');
    });
  });
});
