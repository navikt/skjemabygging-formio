import { FormsApiTranslation } from '../../translations/FormsApiTranslation';
import { IntroSideTkey } from './keys';

type KeyBasedFormsApiTranslation<Key> = FormsApiTranslation & {
  key: Key;
};

const introside: KeyBasedFormsApiTranslation<IntroSideTkey>[] = [
  {
    key: 'introPage.guidePanel.bodyText',
    nb: 'Velkommen til søknaden',
    nn: 'Velkommen til søknaden',
    en: 'Welcome to the application',
  },
  {
    key: 'introPage.beforeYouApplySection.header',
    nb: 'Før du søker',
    nn: 'Før du søker',
    en: 'Before you apply',
  },
  {
    key: 'introPage.beforeYouApplySection.ingress',
    nb: 'Her finner du informasjon om hva du må tenke på før du søker.',
    nn: 'Her finner du informasjon om hva du må tenke på før du søker.',
    en: 'Here you will find information about what you need to think about before you apply.',
  },
  {
    key: 'introPage.hereYouMaySection.headerAlt1',
    nb: 'Her kan du søke om:',
    nn: 'Her kan du søke om:',
    en: 'You can apply for:',
  },
];

const initValues = {
  introside,
};

export { initValues };
