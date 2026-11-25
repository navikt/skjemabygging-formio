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

describe('required intro-page texts', () => {
  it.each(['', ' \n\t '])('rejects empty referenced texts: %j', (emptyText) => {
    const introPage: IntroPage = {
      ...createIntroPage(),
      importantInformation: { title: 'important-title', description: 'important-description' },
      sections: {
        prerequisites: { title: 'prerequisites-title', description: 'description', bulletPoints: ['bullet-1'] },
        optional: { title: 'optional-title', description: 'optional-description' },
      },
    };

    expect(validateIntroPage(introPage, (key) => (key.endsWith('-title') ? 'Title' : emptyText))).toEqual({
      introduction: 'Velkomstmelding må fylles ut',
      importantInformation: { description: 'Brødtekst må fylles ut' },
      sections: {
        prerequisites: { description: 'Ingress må fylles ut', bulletPoints: { 0: 'Kulepunktet må fylles ut' } },
        optional: { description: 'Ingress må fylles ut' },
      },
    });
  });

  it('allows an absent optional title but requires text once the title is added', () => {
    const introPage: IntroPage = {
      ...createIntroPage(),
      importantInformation: { description: 'description' },
    };
    const getText = (key: string) => (key === 'empty-title' ? '' : key);
    expect(validateIntroPage(introPage, getText)).toEqual({});
    introPage.importantInformation!.title = 'empty-title';
    expect(validateIntroPage(introPage, getText)).toEqual({
      importantInformation: { title: 'Overskrift må fylles ut' },
    });
  });
});
