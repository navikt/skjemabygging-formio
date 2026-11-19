import { sanitizeIntroPage } from './sanitizeIntroPage';

describe('sanitizeIntroPage', () => {
  it('removes unsupported sections without mutating the form or supported content', () => {
    const sections = {
      prerequisites: { title: 'prerequisites', bulletPoints: ['shared-key'] },
      scope: { description: 'scope' },
      outOfScope: { description: 'out-of-scope' },
      dataDisclosure: { title: 'disclosure' },
      automaticProcessing: { description: 'processing' },
      optional: { title: 'optional' },
    };
    const introPage = {
      enabled: false,
      introduction: 'introduction',
      importantInformation: { description: 'important' },
      sections: {
        ...sections,
        dataTreatment: { description: 'shared-key' },
        unknownSection: { title: 'unknown' },
        beAwareOf: { description: 'fixed-awareness' },
        dataStorage: { description: 'fixed-storage' },
      },
      selfDeclaration: 'declaration',
    };

    expect(sanitizeIntroPage(introPage)).toEqual({ ...introPage, sections });
    expect(introPage.sections.dataTreatment).toEqual({ description: 'shared-key' });
    expect(sanitizeIntroPage(sanitizeIntroPage(introPage))).toEqual(sanitizeIntroPage(introPage));
  });
});
