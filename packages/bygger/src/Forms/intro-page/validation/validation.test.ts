import { IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { validateIntroPage } from './validation';

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
