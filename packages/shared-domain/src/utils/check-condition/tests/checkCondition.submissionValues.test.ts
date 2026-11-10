import type { SubmissionAttachment } from '../../../models';
import { checkCondition, createComponent, createSubmission } from './testUtils';

const createAttachment = (value = 'ettersender'): SubmissionAttachment => ({
  attachmentId: 'document',
  navId: 'document',
  type: 'default',
  value,
});

describe('condition submission values', () => {
  it.each([
    { when: 'documentation.value', expected: true },
    { when: 'documentation.key', expected: false },
    { when: 'documentation', expected: false },
  ])('evaluates $when as authored without adding aliases or unwrapping objects', ({ when, expected }) => {
    const component = createComponent({ conditional: { when, eq: 'ettersender', show: true } });
    const attachment = Object.freeze(createAttachment());

    expect(checkCondition(component, undefined, { documentation: attachment })).toBe(expected);
    expect(checkCondition(component, undefined, { documentation: [attachment] })).toBe(expected);
    expect(attachment).not.toHaveProperty('key');
  });

  it('reads explicit array values after in-place object and array edits', () => {
    const attachment = createAttachment();
    const data = { documentation: [attachment] };
    const simple = createComponent({ conditional: { when: 'documentation.value', eq: 'ettersender', show: true } });
    const custom = createComponent({
      customConditional: 'show = data.documentation.some(attachment => attachment.value === "ettersender")',
    });
    const evaluate = () => [simple, custom].map((component) => checkCondition(component, undefined, data));

    expect(evaluate()).toEqual([true, true]);
    attachment.value = 'harIkke';
    expect(evaluate()).toEqual([false, false]);
    data.documentation.push(createAttachment());
    expect(evaluate()).toEqual([true, true]);
    data.documentation.splice(0, 2);
    expect(evaluate()).toEqual([false, false]);
  });

  it('passes the original data references to custom conditions without traversing unrelated rows', () => {
    const readUnrelated = vi.fn(() => 'unused');
    const rows = Array.from({ length: 100 }, () => ({
      get unrelated() {
        return readUnrelated();
      },
    }));
    const data = Object.freeze({ visible: true, rows, documentation: Object.freeze(createAttachment()) });
    const submission = createSubmission(data);
    const simple = createComponent({ conditional: { when: 'visible', eq: 'true', show: true } });
    const custom = createComponent({
      customConditional:
        'show = row === data && submission.data === data && data.documentation.value === "ettersender"',
    });

    expect(checkCondition(simple, undefined, data)).toBe(true);
    expect(checkCondition(custom, undefined, data, undefined, undefined, submission)).toBe(true);
    expect(readUnrelated).not.toHaveBeenCalled();
  });
});
