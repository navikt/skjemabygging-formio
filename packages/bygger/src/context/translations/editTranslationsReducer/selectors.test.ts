import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { State } from '.';
import { getTranslationsForSaving } from './selectors';

const translations: FormsApiTranslation[] = [
  { key: 'stored-empty', id: 1, tag: 'introPage', nb: '' },
  { key: 'new-with-bokmal', tag: 'introPage', nb: 'Text' },
  { key: 'new-with-nynorsk', tag: 'introPage', nb: '', nn: 'Text' },
  { key: 'new-with-english', tag: 'introPage', nb: '', en: 'Text' },
  { key: 'active-empty', tag: 'introPage', nb: '' },
  { key: 'text-based', nb: '' },
  { key: 'removed-empty', tag: 'introPage', nb: '' },
  { key: 'removed-whitespace', tag: 'introPage', nb: ' \n ' },
];
const state: State = {
  changes: Object.fromEntries(translations.map((translation) => [translation.key, translation])),
  errors: [],
  status: 'INIT',
  inactiveTranslationWarningKeys: new Set(),
};

describe('getTranslationsForSaving', () => {
  it('keeps stored translations and texts in any language when their reference is removed', () => {
    expect(getTranslationsForSaving(state, ['active-empty'])).toEqual(translations.slice(0, 6));
  });

  it('keeps all changes for validation when no active-reference list is provided', () => {
    expect(getTranslationsForSaving(state)).toEqual(translations);
  });
});
