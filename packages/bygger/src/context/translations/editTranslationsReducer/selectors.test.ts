import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { State } from '.';
import { getTranslationsForSaving } from './selectors';

const translations: FormsApiTranslation[] = [
  { key: 'stored-empty', id: 1, tag: 'introPage', nb: '' },
  { key: 'new-with-bokmal', tag: 'introPage', nb: 'Text' },
  { key: 'new-with-nynorsk', tag: 'skjematekster', nb: '', nn: 'Text' },
  { key: 'new-with-english', nb: '', en: 'Text' },
  { key: 'active-empty', tag: 'introPage', nb: '' },
  { key: 'active-other-tag', tag: 'skjematekster', nb: '' },
  { key: 'stored-other-tag', id: 2, tag: 'skjematekster', nb: '' },
  { key: 'removed-empty', tag: 'introPage', nb: '' },
  { key: 'removed-whitespace', tag: 'introPage', nb: ' \n ' },
  { key: 'text-based', nb: '' },
  { key: 'removed-other-tag', tag: 'skjematekster', nb: '' },
];
const state: State = {
  changes: Object.fromEntries(translations.map((translation) => [translation.key, translation])),
  errors: [],
  status: 'INIT',
  inactiveTranslationWarningKeys: new Set(),
};

describe('getTranslationsForSaving', () => {
  it('filters empty unreferenced drafts regardless of tag while keeping stored, referenced and nonempty translations', () => {
    expect(getTranslationsForSaving(state, ['active-empty', 'active-other-tag'])).toEqual(translations.slice(0, 7));
  });

  it('keeps all changes for validation when no active-reference list is provided', () => {
    expect(getTranslationsForSaving(state)).toEqual(translations);
  });
});
