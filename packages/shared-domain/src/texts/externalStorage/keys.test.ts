import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IntroPage, introPageSectionContent } from '../../models/form/introPage';
import initValues from './initValues';
import { introPageTexts, keys } from './keys';

describe('intro-page text definitions', () => {
  it('covers exactly the model sections and text groups', () => {
    expectTypeOf<keyof typeof introPageSectionContent>().toEqualTypeOf<keyof IntroPage['sections']>();
    expectTypeOf<keyof typeof introPageTexts>().toEqualTypeOf<
      keyof IntroPage['sections'] | 'guidePanel' | 'selfDeclaration'
    >();
  });

  it('keeps defaults aligned with the registry without the retired title', () => {
    expect(new Set(initValues.introPage.map(({ key }) => key))).toEqual(new Set(keys.introPage));
    expect(keys.introPage).not.toContain('introPage.dataTreatment.title');
    expect(keys.introPage).toContain(introPageTexts.dataDisclosure.readMore);
    expect(introPageTexts.dataDisclosure.readMore).toBe('introPage.dataTreatment.readMore');
  });

  it.each([
    { renderer: 'new', directories: ['shared-frontend/src/fyllut/intro-page'] },
    {
      renderer: 'legacy',
      directories: ['shared-components/src/components/intro', 'shared-components/src/pages/intro'],
    },
  ])('references every code-rendered key in the $renderer renderer', ({ directories }) => {
    const source = directories
      .flatMap((directory) => {
        const root = fileURLToPath(new URL(`../../../../${directory}/`, import.meta.url));
        return readdirSync(root, { recursive: true })
          .filter((file) => file.endsWith('.tsx') && !file.endsWith('.test.tsx'))
          .map((file) => readFileSync(join(root, file), 'utf8'));
      })
      .join('\n');

    Object.entries(introPageTexts).forEach(([group, texts]) => {
      Object.entries(texts).forEach(([property, value]) => {
        if (Array.isArray(value) || (group === 'guidePanel' && property === 'hiPersonalized')) {
          return;
        }
        expect(source).toContain(`introPageTexts.${group}.${property}`);
      });
    });
  });
});
