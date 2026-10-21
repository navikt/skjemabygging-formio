import { IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { getMissingTextErrors, validateIntroPage } from './validation';

const createIntroPage = (): IntroPage => ({
  enabled: true,
  introduction: 'Velkommen',
  selfDeclaration: 'introPage.selfDeclaration.description.alt1',
  sections: {
    prerequisites: {
      title: 'introPage.prerequisites.title.alt1',
      description: 'Ta med dette',
      bulletPoints: ['Kulepunkt 1', 'Kulepunkt 2'],
    },
  },
});

describe('validateIntroPage', () => {
  it('accepts an enabled intro page without dataTreatment', () => {
    expect(validateIntroPage(createIntroPage())).toEqual({});
  });

  it('requires a title when dataDisclosure is present', () => {
    const introPage: IntroPage = {
      ...createIntroPage(),
      sections: {
        ...createIntroPage().sections,
        dataDisclosure: {},
      },
    };

    expect(validateIntroPage(introPage)).toEqual({
      sections: {
        dataDisclosure: {
          title: 'Overskrift må fylles ut',
        },
      },
    });
  });

  it('allows a single valid dataDisclosure bullet point', () => {
    const introPage: IntroPage = {
      ...createIntroPage(),
      sections: {
        ...createIntroPage().sections,
        dataDisclosure: {
          title: 'introPage.dataDisclosure.title.alt1',
          bulletPoints: ['Person- og adresseinformasjon fra Folkeregisteret'],
        },
      },
    };

    expect(validateIntroPage(introPage)).toEqual({});
  });
});

describe('getMissingTextErrors', () => {
  it('maps missing text keys to the fields that reference them', () => {
    const introPage: IntroPage = {
      ...createIntroPage(),
      importantInformation: { title: 'important-title', description: 'important-description' },
      sections: {
        prerequisites: { description: 'prerequisites-description', bulletPoints: ['bullet-1', 'bullet-2'] },
        optional: { title: 'optional-title' },
      },
    };

    expect(
      getMissingTextErrors(introPage, ['Velkommen', 'important-title', 'bullet-2', 'optional-title', 'unknown']),
    ).toEqual({
      introduction: 'Velkomstmelding må fylles ut',
      importantInformation: { title: 'Overskrift må fylles ut' },
      sections: {
        prerequisites: { bulletPoints: { 1: 'Kulepunktet må fylles ut' } },
        optional: { title: 'Overskrift må fylles ut' },
      },
    });
  });

  it('ignores keys referenced only by unsupported sections', () => {
    const introPage = {
      ...createIntroPage(),
      sections: { ...createIntroPage().sections, dataTreatment: { description: 'retired-key' } },
    } as IntroPage;

    expect(getMissingTextErrors(introPage, ['retired-key'])).toEqual({});
  });
});
